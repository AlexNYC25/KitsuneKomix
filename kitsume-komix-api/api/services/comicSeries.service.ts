import {
  getComicSeriesWithMetadataFilteringSorting,
} from "#sqlite/models/comicSeries.model.ts";

import { fetchComicBooksWithRelatedMetadata } from "./comicbooks.service.ts";

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
        offset: serviceDataPagination.pageNumber *
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
    filter: "seriesId",
    filterProperty: seriesId.toString(),
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
  const thumbnailUrl: string | undefined =
    comicBooksBelongingToSeries.length > 0
      ? `/api/image/thumbnails/${comicBooksBelongingToSeries[0].id}` // TODO: Check that this is the correct way to get the thumbnail url for the first comic book in the series
      : undefined;
  const credits: ComicBookMetadataOnly =
    complileTheCompleteComicSeriesCreditsMetadata(comicBooksBelongingToSeries);

  // This function would involve fetching the credits for each comic book in the series and then deduplicating them to get a complete list of unique credits for the series as a whole. This is a non-trivial amount of additional work so I'm leaving it as a placeholder for now and we can implement it later if we have time or if it's needed by the frontend.
  return {
    totalComicBooks,
    totalSize,
    thumbnailUrl,
    credits,
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
export const complileTheCompleteComicSeriesCreditsMetadata = (
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

  for (const creditType in completeCredits) {
    if (completeCredits[creditType as keyof ComicBookMetadataOnly]) {
      const uniqueCredits = new Map();
      for (
        const credit
          of completeCredits[creditType as keyof ComicBookMetadataOnly] as any[]
      ) {
        uniqueCredits.set(credit.id, credit);
      }
      completeCredits[creditType as keyof ComicBookMetadataOnly] = Array.from(
        uniqueCredits.values(),
      );
    }
  }

  return completeCredits;
};
