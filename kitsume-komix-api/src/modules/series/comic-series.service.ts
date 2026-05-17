import {
  getComicSeriesWithMetadataFilteringSorting,
} from "#infrastructure/db/sqlite/models/comicSeries.model.ts";

import {
  attachThumbnailToComicBook,
  fetchComicBooksWithRelatedMetadata,
} from "#modules/comics/index.ts";

import type {
  ComicBookMetadataOnly,
  ComicBookWithMetadata,
  ComicFilterField,
  ComicSeries,
  ComicSeriesFilterField,
  ComicSeriesFilterItem,
  ComicSeriesMetadata,
  ComicSeriesSortField,
  ComicSeriesWithMetadata,
  ComicSortField,
  QueryData,
  RequestFilterParametersValidated,
  RequestPaginationParametersValidated,
  RequestParametersValidated,
  RequestSortParametersValidated,
} from "#types/index.ts";

import { validateAndBuildQueryParams } from "#utilities/parameters.ts";

/**
 * Fetch all comic series with related metadata.
 * This includes the total number of comic books in each series, the total file size of all comic books in the series,
 * @param queryData - The validated query parameters for pagination, sorting, and filtering.
 * @returns A promise that resolves to an array of ComicSeries objects with related metadata
 *
 * used by
 * - GET /api/comic-series/ (with pagination, sorting, and filtering)
 * - GET /api/comic-series/list (with pagination and letter filtering)
 * - GET /api/comic-series/latest
 * - GET /api/comic-series/updated
 * - GET /api/comic-series/{id}
 */
export const fetchComicSeries = async (
  queryData: RequestParametersValidated<
    ComicSeriesSortField,
    ComicSeriesFilterField
  >,
): Promise<ComicSeriesWithMetadata[]> => {
  try {
    const serviceDataPagination: RequestPaginationParametersValidated =
      queryData.pagination;
    const serviceDataFilter:
      | RequestFilterParametersValidated<ComicSeriesFilterField>
      | undefined = queryData.filter;
    const serviceDataSort: RequestSortParametersValidated<
      ComicSeriesSortField
    > = queryData.sort;

    const comicSeriesFromDb: ComicSeries[] =
      await getComicSeriesWithMetadataFilteringSorting({
        filters: [serviceDataFilter] as ComicSeriesFilterItem[], // Cast to expected type
        sort: {
          property: serviceDataSort.sortProperty,
          order: serviceDataSort.sortOrder,
        },
        offset: (serviceDataPagination.pageNumber - 1) *
          serviceDataPagination.pageSize,
        limit: serviceDataPagination.pageSize + 1,
      });

    const comicSeriesWithMetadata: ComicSeriesWithMetadata[] = [];

    for (const series of comicSeriesFromDb) {
      const currentComicSeriesMetadata: ComicSeriesMetadata =
        await fetchAComicSeriesAssociatedMetadataById(series.id);

      (series as ComicSeriesWithMetadata).totalComicBooks =
        currentComicSeriesMetadata.totalComicBooks;
      (series as ComicSeriesWithMetadata).totalSize =
        currentComicSeriesMetadata.totalSize;
      (series as ComicSeriesWithMetadata).thumbnailUrl =
        currentComicSeriesMetadata.thumbnailUrl;
      (series as ComicSeriesWithMetadata).credits =
        currentComicSeriesMetadata.credits;
      (series as ComicSeriesWithMetadata).years =
        currentComicSeriesMetadata.years;

      comicSeriesWithMetadata.push(series as ComicSeriesWithMetadata);
    }

    return comicSeriesWithMetadata;
  } catch (error) {
    throw new Error(
      "Error fetching comic series: " +
        (error instanceof Error ? error.message : String(error)),
    );
  }
};

/**
 * Fetch associated metadata for a comic series by its ID, of the type ComicSeriesMetadata
 * including total number of comic books in the series, total file size of all comic books in the series, thumbnail url for the series (which is the thumbnail for the first comic book in the series)
 * and complete credits for the series (which would involve fetching the credits for each comic book in the series and then deduplicating them to get a complete list of unique credits for the series as a whole).
 *
 * @param seriesId
 * @returns A promise that resolves to a ComicSeriesMetadata object.
 */
const fetchAComicSeriesAssociatedMetadataById = async (
  seriesId: number,
): Promise<ComicSeriesMetadata> => {
  const queryData: QueryData = {
    page: 0,
    pageSize: 100, // Arbitrary large number to fetch all comic books in the series, we can implement proper pagination later if needed, but most comics should have less than 100 comic books in a series so this should be fine for now NOTE: Spawn, savage dragon, and other long-running series might have more than 100 comic books in a series, so we should implement proper pagination for this at some point to ensure we can fetch all comic books in a series if needed
    filter: seriesId.toString(),
    filterProperty: "seriesId",
  };
  const serviceData: RequestParametersValidated<
    ComicSortField,
    ComicFilterField
  > = validateAndBuildQueryParams(queryData, "comics");
  const comicBooksBelongingToSeries: ComicBookWithMetadata[] =
    await fetchComicBooksWithRelatedMetadata(serviceData);

  const totalComicBooks: number = comicBooksBelongingToSeries.length;
  const totalSize: number = comicBooksBelongingToSeries.reduce(
    (total, book) => total + (book.fileSize || 0),
    0,
  );
  let thumbnailUrl: string | undefined;
  let comicYears: number[] | undefined;

  if (comicBooksBelongingToSeries.length > 0) {
    // sort the comic books by their issue number (if they have one) to ensure we get the thumbnail for the first comic book in the series, otherwise we might end up with the thumbnail for a random comic book in the series which would be bad UX. If issue number is not available, we can sort by release date or just take the first comic book in the list.
    const comicBooksBelongingToSeriesSorted: ComicBookWithMetadata[] = [...comicBooksBelongingToSeries];
    comicBooksBelongingToSeriesSorted.sort((a, b) => {
      if (a.issueNumber && b.issueNumber) {
        return Number.parseFloat(a.issueNumber) - Number.parseFloat(b.issueNumber);
      } else if (a.publicationDate && b.publicationDate) {
        return new Date(a.publicationDate).getTime() - new Date(b.publicationDate).getTime();
      } else {
        return 0; // If neither issue number nor release date is available, maintain original order
      }
    });


    const firstComicWithThumbnail = await attachThumbnailToComicBook(
      comicBooksBelongingToSeriesSorted[0].id,
    );
    thumbnailUrl = firstComicWithThumbnail?.thumbnailUrl;

    const comicYearsSet = comicBooksBelongingToSeriesSorted.reduce((years: Set<number>, comic) => {
      if (comic.publicationDate) {
        const year = new Date(comic.publicationDate).getFullYear();
        years.add(year);
      }
      return years;
    }, new Set<number>());

    if (comicYearsSet.size > 0) {
      comicYears = Array.from(comicYearsSet).sort((a, b) => a - b);
    } else {
      comicYears = undefined;
    }
  }

  const credits: ComicBookMetadataOnly =
    compileTheCompleteComicSeriesCreditsMetadata(comicBooksBelongingToSeries);

  // This function would involve fetching the credits for each comic book in the series and then deduplicating them to get a complete list of unique credits for the series as a whole. This is a non-trivial amount of additional work so I'm leaving it as a placeholder for now and we can implement it later if we have time or if it's needed by the frontend.
  return {
    totalComicBooks,
    totalSize,
    thumbnailUrl,
    credits,
    years: comicYears,
  };
};

/**
 * We want to compile the complete credits metadata for a comic series by iterating through all the comic books in the series
 * and collecting their credits (writers, pencillers, inkers, letterers, editors, colorists, cover artists, publishers, imprints, genres, characters, teams, locations, story arcs, and series groups).
 * We will then deduplicate these credits to get a unique list of credits for the entire series.
 *
 * @param comicBooks An array of data objects that are of the type ComicBookWithMetadata
 * @returns A ComicBookMetadataOnly object containing the deduplicated credits for the entire series.
 */
export const compileTheCompleteComicSeriesCreditsMetadata = (
  comicBooks: ComicBookWithMetadata[],
): ComicBookMetadataOnly => {
  const completeCredits: ComicBookMetadataOnly = {};

  for (const book of comicBooks) {
    if (book.writers) {
      completeCredits.writers = completeCredits.writers || [];
      completeCredits.writers.push(...book.writers);
    }
    if (book.pencillers) {
      completeCredits.pencillers = completeCredits.pencillers || [];
      completeCredits.pencillers.push(...book.pencillers);
    }
    if (book.inkers) {
      completeCredits.inkers = completeCredits.inkers || [];
      completeCredits.inkers.push(...book.inkers);
    }
    if (book.letterers) {
      completeCredits.letterers = completeCredits.letterers || [];
      completeCredits.letterers.push(...book.letterers);
    }
    if (book.editors) {
      completeCredits.editors = completeCredits.editors || [];
      completeCredits.editors.push(...book.editors);
    }
    if (book.colorists) {
      completeCredits.colorists = completeCredits.colorists || [];
      completeCredits.colorists.push(...book.colorists);
    }
    if (book.coverArtists) {
      completeCredits.coverArtists = completeCredits.coverArtists || [];
      completeCredits.coverArtists.push(...book.coverArtists);
    }
    if (book.publishers) {
      completeCredits.publishers = completeCredits.publishers || [];
      completeCredits.publishers.push(...book.publishers);
    }
    if (book.imprints) {
      completeCredits.imprints = completeCredits.imprints || [];
      completeCredits.imprints.push(...book.imprints);
    }
    if (book.genres) {
      completeCredits.genres = completeCredits.genres || [];
      completeCredits.genres.push(...book.genres);
    }
    if (book.characters) {
      completeCredits.characters = completeCredits.characters || [];
      completeCredits.characters.push(...book.characters);
    }
    if (book.teams) {
      completeCredits.teams = completeCredits.teams || [];
      completeCredits.teams.push(...book.teams);
    }
    if (book.locations) {
      completeCredits.locations = completeCredits.locations || [];
      completeCredits.locations.push(...book.locations);
    }
    if (book.storyArcs) {
      completeCredits.storyArcs = completeCredits.storyArcs || [];
      completeCredits.storyArcs.push(...book.storyArcs);
    }
    if (book.seriesGroups) {
      completeCredits.seriesGroups = completeCredits.seriesGroups || [];
      completeCredits.seriesGroups.push(...book.seriesGroups);
    }
  }

  const dedupeById = <T extends { id: number | string }>(items: T[]): T[] => {
    const uniqueCredits = new Map<number | string, T>();
    for (const credit of items) {
      uniqueCredits.set(credit.id, credit);
    }
    return Array.from(uniqueCredits.values());
  };

  if (completeCredits.writers) {
    completeCredits.writers = dedupeById(completeCredits.writers);
  }
  if (completeCredits.pencillers) {
    completeCredits.pencillers = dedupeById(completeCredits.pencillers);
  }
  if (completeCredits.inkers) {
    completeCredits.inkers = dedupeById(completeCredits.inkers);
  }
  if (completeCredits.letterers) {
    completeCredits.letterers = dedupeById(completeCredits.letterers);
  }
  if (completeCredits.editors) {
    completeCredits.editors = dedupeById(completeCredits.editors);
  }
  if (completeCredits.colorists) {
    completeCredits.colorists = dedupeById(completeCredits.colorists);
  }
  if (completeCredits.coverArtists) {
    completeCredits.coverArtists = dedupeById(completeCredits.coverArtists);
  }
  if (completeCredits.publishers) {
    completeCredits.publishers = dedupeById(completeCredits.publishers);
  }
  if (completeCredits.imprints) {
    completeCredits.imprints = dedupeById(completeCredits.imprints);
  }
  if (completeCredits.genres) {
    completeCredits.genres = dedupeById(completeCredits.genres);
  }
  if (completeCredits.characters) {
    completeCredits.characters = dedupeById(completeCredits.characters);
  }
  if (completeCredits.teams) {
    completeCredits.teams = dedupeById(completeCredits.teams);
  }
  if (completeCredits.locations) {
    completeCredits.locations = dedupeById(completeCredits.locations);
  }
  if (completeCredits.storyArcs) {
    completeCredits.storyArcs = dedupeById(completeCredits.storyArcs);
  }
  if (completeCredits.seriesGroups) {
    completeCredits.seriesGroups = dedupeById(completeCredits.seriesGroups);
  }

  return completeCredits;
};

/**
 * Goes through the entire library of comic books across all series and compiles the
 * unique metadata values that can be used as filter options in the UI.
 *
 * The response shape mirrors MetadataExpandedWithSeriesCompiledSchema, so the route can
 * return it directly under the `data` key.
 */
export const compileEntireSeriesMetadataAndAdditionalSeriesInfo = async (): Promise<ComicBookMetadataOnly & { years?: number[]; letters?: string[] }> => {
  // Fetch all comic series with their metadata using a large page size to ensure we get all series in one request.
  // fetchComicSeries handles pagination and metadata enrichment (credits and years) per series.
  const queryData: RequestParametersValidated<ComicSeriesSortField, ComicSeriesFilterField> = {
    pagination: { pageNumber: 1, pageSize: 999999 }, // Large page size to fetch all series at once
    sort: { sortProperty: 'id' as ComicSeriesSortField, sortOrder: 'asc' },
    filter: undefined,
  };

  const allSeriesWithMetadata: ComicSeriesWithMetadata[] = await fetchComicSeries(queryData);

  // Initialize aggregation variables for library-wide filter values.
  const allYears = new Set<number>();
  const allLetters = new Set<string>();
  const completeLibraryCredits: ComicBookMetadataOnly = {};

  // Iterate through all series and aggregate their metadata.
  // We only collect the nested credit arrays and years here because those are the values
  // the filter-values endpoint needs to expose to the client.
  for (const series of allSeriesWithMetadata) {
    const normalizedSeriesName = series.name.trim();
    const startingLetter = normalizedSeriesName.charAt(0).toLowerCase();

    if (/^[a-z]$/.test(startingLetter)) {
      allLetters.add(startingLetter);
    }

    // Collect all unique years across all series that have published comics.
    if (series.years) {
      series.years.forEach(year => allYears.add(year));
    }

    // Aggregate credits from each series into library-wide credits.
    // We deduplicate each category after the collection pass so repeated names only appear once.
    if (series.credits) {
      if (series.credits.writers) {
        completeLibraryCredits.writers = (completeLibraryCredits.writers || []).concat(series.credits.writers);
      }
      if (series.credits.pencillers) {
        completeLibraryCredits.pencillers = (completeLibraryCredits.pencillers || []).concat(series.credits.pencillers);
      }
      if (series.credits.inkers) {
        completeLibraryCredits.inkers = (completeLibraryCredits.inkers || []).concat(series.credits.inkers);
      }
      if (series.credits.letterers) {
        completeLibraryCredits.letterers = (completeLibraryCredits.letterers || []).concat(series.credits.letterers);
      }
      if (series.credits.editors) {
        completeLibraryCredits.editors = (completeLibraryCredits.editors || []).concat(series.credits.editors);
      }
      if (series.credits.colorists) {
        completeLibraryCredits.colorists = (completeLibraryCredits.colorists || []).concat(series.credits.colorists);
      }
      if (series.credits.coverArtists) {
        completeLibraryCredits.coverArtists = (completeLibraryCredits.coverArtists || []).concat(series.credits.coverArtists);
      }
      if (series.credits.publishers) {
        completeLibraryCredits.publishers = (completeLibraryCredits.publishers || []).concat(series.credits.publishers);
      }
      if (series.credits.imprints) {
        completeLibraryCredits.imprints = (completeLibraryCredits.imprints || []).concat(series.credits.imprints);
      }
      if (series.credits.genres) {
        completeLibraryCredits.genres = (completeLibraryCredits.genres || []).concat(series.credits.genres);
      }
      if (series.credits.characters) {
        completeLibraryCredits.characters = (completeLibraryCredits.characters || []).concat(series.credits.characters);
      }
      if (series.credits.teams) {
        completeLibraryCredits.teams = (completeLibraryCredits.teams || []).concat(series.credits.teams);
      }
      if (series.credits.locations) {
        completeLibraryCredits.locations = (completeLibraryCredits.locations || []).concat(series.credits.locations);
      }
      if (series.credits.storyArcs) {
        completeLibraryCredits.storyArcs = (completeLibraryCredits.storyArcs || []).concat(series.credits.storyArcs);
      }
      if (series.credits.seriesGroups) {
        completeLibraryCredits.seriesGroups = (completeLibraryCredits.seriesGroups || []).concat(series.credits.seriesGroups);
      }
    }
  }

  // Helper function to deduplicate credits by their unique ID
  // This reuses the same deduplication logic as compileTheCompleteComicSeriesCreditsMetadata
  const dedupeById = <T extends { id: number | string }>(items: T[]): T[] => {
    const uniqueCredits = new Map<number | string, T>();
    for (const credit of items) {
      uniqueCredits.set(credit.id, credit);
    }
    return Array.from(uniqueCredits.values());
  };

  // Deduplicate all aggregated credit types to create a unique library-wide credits list
  // This ensures that if a creator worked on comics in multiple series, they only appear once in the library metadata
  if (completeLibraryCredits.writers) {
    completeLibraryCredits.writers = dedupeById(completeLibraryCredits.writers);
  }
  if (completeLibraryCredits.pencillers) {
    completeLibraryCredits.pencillers = dedupeById(completeLibraryCredits.pencillers);
  }
  if (completeLibraryCredits.inkers) {
    completeLibraryCredits.inkers = dedupeById(completeLibraryCredits.inkers);
  }
  if (completeLibraryCredits.letterers) {
    completeLibraryCredits.letterers = dedupeById(completeLibraryCredits.letterers);
  }
  if (completeLibraryCredits.editors) {
    completeLibraryCredits.editors = dedupeById(completeLibraryCredits.editors);
  }
  if (completeLibraryCredits.colorists) {
    completeLibraryCredits.colorists = dedupeById(completeLibraryCredits.colorists);
  }
  if (completeLibraryCredits.coverArtists) {
    completeLibraryCredits.coverArtists = dedupeById(completeLibraryCredits.coverArtists);
  }
  if (completeLibraryCredits.publishers) {
    completeLibraryCredits.publishers = dedupeById(completeLibraryCredits.publishers);
  }
  if (completeLibraryCredits.imprints) {
    completeLibraryCredits.imprints = dedupeById(completeLibraryCredits.imprints);
  }
  if (completeLibraryCredits.genres) {
    completeLibraryCredits.genres = dedupeById(completeLibraryCredits.genres);
  }
  if (completeLibraryCredits.characters) {
    completeLibraryCredits.characters = dedupeById(completeLibraryCredits.characters);
  }
  if (completeLibraryCredits.teams) {
    completeLibraryCredits.teams = dedupeById(completeLibraryCredits.teams);
  }
  if (completeLibraryCredits.locations) {
    completeLibraryCredits.locations = dedupeById(completeLibraryCredits.locations);
  }
  if (completeLibraryCredits.storyArcs) {
    completeLibraryCredits.storyArcs = dedupeById(completeLibraryCredits.storyArcs);
  }
  if (completeLibraryCredits.seriesGroups) {
    completeLibraryCredits.seriesGroups = dedupeById(completeLibraryCredits.seriesGroups);
  }

  // Return the flattened metadata object expected by the response schema.
  return {
    ...completeLibraryCredits,
    letters: Array.from(allLetters).sort((a, b) => a.localeCompare(b)),
    years: Array.from(allYears).sort((a, b) => a - b),
  };
};