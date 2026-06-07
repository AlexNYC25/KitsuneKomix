import { apiLogger } from "#logger/loggers.ts";
import { getClient } from "#infrastructure/db/sqlite/client.ts";

import { fetchComicBooksWithRelatedMetadata } from "./comic-books.service.ts";

import { getMetadataForComicBooksBatch } from "#infrastructure/db/sqlite/models/comicMetadataBatch.model.ts";

import {
  getWritersByComicBookId,
  insertComicWriter,
  linkWriterToComicBook,
  unlinkWritersToComicBook,
  getPencilersByComicBookId,
  insertComicPenciler,
  linkPencilerToComicBook,
  unlinkPencilersToComicBook,
  getInkersByComicBookId,
  insertComicInker,
  linkInkerToComicBook,
  unlinkInkersToComicBook,
  getLetterersByComicBookId,
  insertComicLetterer,
  linkLettererToComicBook,
  unlinkLetterersToComicBook,
  getEditorsByComicBookId,
  insertComicEditor,
  linkEditorToComicBook,
  unlinkEditorsToComicBook,
  getColoristByComicBookId,
  insertComicColorist,
  linkColoristToComicBook,
  unlinkColoristsToComicBook,
  getCoverArtistsByComicBookId,
  insertComicCoverArtist,
  linkCoverArtistToComicBook,
  unlinkCoverArtistsToComicBook,
  getPublishersByComicBookId,
  insertComicPublisher,
  linkPublisherToComicBook,
  unlinkPublishersToComicBook,
  getImprintsByComicBookId,
  insertComicImprint,
  linkImprintToComicBook,
  unlinkImprintsToComicBook,
  getGenresForComicBook,
  insertComicGenre,
  linkGenreToComicBook,
  unlinkGenresToComicBook,
  getCharactersByComicBookId,
  insertComicCharacter,
  linkCharacterToComicBook,
  unlinkCharactersToComicBook,
  getTeamsByComicBookId,
  insertComicTeam,
  linkTeamToComicBook,
  unlinkTeamsToComicBook,
  getLocationsByComicBookId,
  insertComicLocation,
  linkLocationToComicBook,
  unlinkLocationsToComicBook,
  getStoryArcsByComicBookId,
  unlinkStoryArcsToComicBook,
} from "#infrastructure/db/sqlite/models/comicMetadataImports.ts";

import { dedupeById } from "#utilities/standardize.ts";

import type {
  ComicBookWithMetadata,
  ComicBooksFilterValues,
  ComicFilterField,
  ComicSortField,
  ComicBookMetadataOnly,
  ComicMetadataUpdateData,
  RequestParametersValidated,
  ComicBook,
  BatchMetadataResult,
  ComicBookMetadata
} from "#types/index.ts";

/**
 * Fetch all associated metadata for a specific comic book.
 *
 * Retrieves comprehensive metadata including writers, artists, publishers,
 * genres, characters, and other entity associations for a comic book.
 *
 * @param id - The unique identifier of the comic book
 * @returns A promise that resolves to ComicBookMetadataOnly containing all metadata
 * @throws Error if database is not initialized or query fails
 *
 * @example
 * const metadata = await fetchAComicsAssociatedMetadataById(123);
 * // Returns: { writers: [...], pencilers: [...], publishers: [...], ... }
 *
 * @usedBy
 * - /api/comic-books/{id}/metadata
 */
export const fetchAComicsAssociatedMetadataById = async (
  id: number,
): Promise<ComicBookMetadataOnly> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const metadata = {
      writers: await getWritersByComicBookId(id),
      pencilers: await getPencilersByComicBookId(id),
      inkers: await getInkersByComicBookId(id),
      letterers: await getLetterersByComicBookId(id),
      editors: await getEditorsByComicBookId(id),
      colorists: await getColoristByComicBookId(id),
      coverArtists: await getCoverArtistsByComicBookId(id),
      publishers: await getPublishersByComicBookId(id),
      imprints: await getImprintsByComicBookId(id),
      genres: await getGenresForComicBook(id),
      characters: await getCharactersByComicBookId(id),
      teams: await getTeamsByComicBookId(id),
      locations: await getLocationsByComicBookId(id),
      storyArcs: await getStoryArcsByComicBookId(id),
    };

    return {
      ...metadata,
    };
  } catch (error) {
    apiLogger.error("Error fetching comic book metadata:" + error);
    throw error;
  }
};

/**
 * Update metadata for a single comic book.
 *
 * Handles adding and/or replacing metadata entities (writers, artists, etc.)
 * for a specific comic book. Can either append to existing metadata or
 * replace all existing metadata of a given type.
 *
 * @param comicId - The unique identifier of the comic book to update
 * @param metadataUpdates - Array of metadata update operations to apply
 * @returns A promise that resolves to true if update succeeded, false otherwise
 *
 * @example
 * await updateComicBookMetadata(123, [
 *   { metadataType: 'writers', values: ['John Smith'], replaceExisting: false },
 *   { metadataType: 'genres', values: ['Action', 'Adventure'], replaceExisting: true }
 * ]);
 *
 * @usedBy
 * - /api/comic-books/{id}/update
 */
export const updateComicBookMetadata = async (
  comicId: number,
  metadataUpdates: Array<ComicMetadataUpdateData>,
): Promise<boolean> => {
  try {
    for (const update of metadataUpdates) {
      const updateType = update.metadataType;
      const replaceExisting = update.replaceExisting ?? false;
      const values = update.values as string[];

      if (!values || values.length === 0) {
        console.warn(
          `No values provided for ${updateType} on comic ID ${comicId}`,
        );
        continue;
      }

      if (replaceExisting) {
        try {
          switch (updateType) {
            case "writers":
              await unlinkWritersToComicBook(comicId);
              break;
            case "pencilers":
              await unlinkPencilersToComicBook(comicId);
              break;
            case "inkers":
              await unlinkInkersToComicBook(comicId);
              break;
            case "letterers":
              await unlinkLetterersToComicBook(comicId);
              break;
            case "editors":
              await unlinkEditorsToComicBook(comicId);
              break;
            case "colorists":
              await unlinkColoristsToComicBook(comicId);
              break;
            case "coverArtists":
              await unlinkCoverArtistsToComicBook(comicId);
              break;
            case "publishers":
              await unlinkPublishersToComicBook(comicId);
              break;
            case "imprints":
              await unlinkImprintsToComicBook(comicId);
              break;
            case "genres":
              await unlinkGenresToComicBook(comicId);
              break;
            case "characters":
              await unlinkCharactersToComicBook(comicId);
              break;
            case "teams":
              await unlinkTeamsToComicBook(comicId);
              break;
            case "locations":
              await unlinkLocationsToComicBook(comicId);
              break;
            case "storyArcs":
              await unlinkStoryArcsToComicBook(comicId);
              break;
          }
        } catch (error) {
          apiLogger.error(`Error unlinking ${updateType} from comic book:` + error);
          throw error;
        }
      }

      try {
        for (const value of values) {
          let metadataId: number;

          switch (updateType) {
            case "writers": {
              metadataId = await insertComicWriter(value);
              await linkWriterToComicBook(metadataId, comicId);
              break;
            }
            case "pencilers": {
              metadataId = await insertComicPenciler(value);
              await linkPencilerToComicBook(metadataId, comicId);
              break;
            }
            case "inkers": {
              metadataId = await insertComicInker(value);
              await linkInkerToComicBook(metadataId, comicId);
              break;
            }
            case "letterers": {
              metadataId = await insertComicLetterer(value);
              await linkLettererToComicBook(metadataId, comicId);
              break;
            }
            case "editors": {
              metadataId = await insertComicEditor(value);
              await linkEditorToComicBook(metadataId, comicId);
              break;
            }
            case "colorists": {
              metadataId = await insertComicColorist(value);
              await linkColoristToComicBook(metadataId, comicId);
              break;
            }
            case "coverArtists": {
              metadataId = await insertComicCoverArtist(value);
              await linkCoverArtistToComicBook(metadataId, comicId);
              break;
            }
            case "publishers": {
              metadataId = await insertComicPublisher(value);
              await linkPublisherToComicBook(metadataId, comicId);
              break;
            }
            case "imprints": {
              metadataId = await insertComicImprint(value);
              await linkImprintToComicBook(metadataId, comicId);
              break;
            }
            case "genres": {
              metadataId = await insertComicGenre(value);
              await linkGenreToComicBook(metadataId, comicId);
              break;
            }
            case "characters": {
              metadataId = await insertComicCharacter(value);
              await linkCharacterToComicBook(metadataId, comicId);
              break;
            }
            case "teams": {
              metadataId = await insertComicTeam(value);
              await linkTeamToComicBook(metadataId, comicId);
              break;
            }
            case "locations": {
              metadataId = await insertComicLocation(value);
              await linkLocationToComicBook(metadataId, comicId);
              break;
            }
            case "storyArcs": {
              console.warn("Story arcs update not yet implemented");
              break;
            }
            case "seriesGroups": {
              console.warn("Series groups update not yet implemented");
              break;
            }
            default:
              console.warn(`Unknown metadata type: ${updateType}`);
          }
        }
      } catch (error) {
        apiLogger.error(`Error updating ${updateType} for comic book:` + error);
        throw error;
      }
    }

    return true;
  } catch (error) {
    apiLogger.error("Error updating comic book metadata:" + error);
    return false;
  }
};

/**
 * Bulk update metadata for multiple comic books.
 *
 * Applies the same metadata updates to multiple comic books at once.
 * Uses the same update logic as updateComicBookMetadata but iterates
 * over a list of comic book IDs.
 *
 * @param comicIds - Array of comic book IDs to update
 * @param metadataUpdates - Array of metadata update operations to apply
 * @returns A promise that resolves to the number of successfully updated comics
 *
 * @example
 * const count = await updateComicBookMetadataBulk(
 *   [123, 456, 789],
 *   [{ metadataType: 'genres', values: ['Action'], replaceExisting: true }]
 * );
 * // Returns: 3 if all updates succeeded
 *
 * @usedBy
 * - /api/comic-books/update-batch
 */
export const updateComicBookMetadataBulk = async (
  comicIds: number[],
  metadataUpdates: Array<ComicMetadataUpdateData>,
): Promise<number> => {
  let numberOfSuccessfulUpdates = 0;

  try {
    for (const comicId of comicIds) {
      const success = await updateComicBookMetadata(comicId, metadataUpdates);
      if (!success) {
        apiLogger.error(`Failed to update metadata for comic ID ${comicId}`);
        return numberOfSuccessfulUpdates;
      } else {
        numberOfSuccessfulUpdates++;
      }
    }
    return numberOfSuccessfulUpdates;
  } catch (error) {
    apiLogger.error("Error updating comic book metadata in bulk:" + error);
    return 0;
  }
};

/**
 * Compiles the metadata values concerning creator credits (writers, artists, etc.) across a list of comic books.
 * 
 * @param comicBooks - Array of ComicBookWithMetadata to compile creator credits from
 * @returns ComicBookMetadataOnly containing aggregated creator credits without duplicates
 */
const compileCreatorCredits = (comicBooks: ComicBookWithMetadata[]): ComicBookMetadataOnly => {
  const completeCreatorCredits: ComicBookMetadataOnly = {};
  const creatorFields = ["writers", "pencilers", "inkers", "letterers", "editors", "colorists", "coverArtists"] as const;

  for (const comic of comicBooks) {
    creatorFields.forEach((field) => {
      if(comic[field]) {
        completeCreatorCredits[field] = (completeCreatorCredits[field] || []).concat(comic[field]);
      }
    });
  }

  creatorFields.forEach((field) => {
    if (completeCreatorCredits[field]) {
      completeCreatorCredits[field] = dedupeById(completeCreatorCredits[field]!);
    }
  })

  return completeCreatorCredits;
}

/**
 * Compiles the metadata values concerning publishers and imprints across a list of comic books.
 * 
 * @param comicBooks - Array of ComicBookWithMetadata to compile publishing credits from
 * @return ComicBookMetadataOnly containing aggregated publisher and imprint credits without duplicates
 */
const compilePublishingCredits = (comicBooks: ComicBookWithMetadata[]): ComicBookMetadataOnly => {
  const completePublishingCredits: ComicBookMetadataOnly = {};
  const publishingFields = ["publishers", "imprints", "genres"] as const;

  for (const comic of comicBooks) {
    publishingFields.forEach((field) => {
      if(comic[field]) {
        completePublishingCredits[field] = (completePublishingCredits[field] || []).concat(comic[field]);
      }
    });
  }

  publishingFields.forEach((field) => {
    if (completePublishingCredits[field]) {
      completePublishingCredits[field] = dedupeById(completePublishingCredits[field]!);
    }
  });

  return completePublishingCredits;
}

/**
 * Compiles the metadata values concerning characters, teams, and locations across a list of comic books.
 * 
 * @param comicBooks - Array of ComicBookWithMetadata to compile character, teams and locations from
 * @returns ComicBookMetadataOnly containing aggregated character, team, and location credits without duplicates
 */
const compileStoryAndWorldCredits = (comicBooks: ComicBookWithMetadata[]): ComicBookMetadataOnly => {
  const completeStoryAndWorldCredits: ComicBookMetadataOnly = {};
  const storyAndWorldFields = ["characters", "teams", "locations", "storyArcs", "seriesGroups"] as const;

  for (const comic of comicBooks) {
    storyAndWorldFields.forEach((field) => {
      if(comic[field]) {
        completeStoryAndWorldCredits[field] = (completeStoryAndWorldCredits[field] || []).concat(comic[field]);
      }
    });
  }

  storyAndWorldFields.forEach((field) => {
    if (completeStoryAndWorldCredits[field]) {
      completeStoryAndWorldCredits[field] = dedupeById(completeStoryAndWorldCredits[field]!);
    }
  });

  return completeStoryAndWorldCredits;
}


/**
 * Compiles all comic-book-level metadata and additional scalar values that are valid filter options for comic-book browsing.
 * 
 * @param comicBooks - Array of ComicBookWithMetadata to compile filter values from
 * @returns 
 */
const compileComicBookLevelFilterValues = (comicBooks: ComicBookWithMetadata[]): ComicBooksFilterValues => {
  const allYears = new Set<number>();
  const allLetters = new Set<string>(); // This will contain the starting letters of comic book titles, used for letter-based pagination filtering
  const allLanguages = new Set<string>();
  const allFormats = new Set<string>();
  const allReadingDirections = new Set<string>();
  const allAgeRatings = new Set<string>();
  const allLibraryIds = new Set<number>();
  const allMangaValues = new Set<number>();
  const allBlackAndWhiteValues = new Set<number>();
  const allSeriesNames = new Set<string>();

  for (const comic of comicBooks) {
    if (comic.publicationDate) {
      const publicationYear = new Date(comic.publicationDate).getFullYear();
      if (!Number.isNaN(publicationYear)) {
        allYears.add(publicationYear);
      }
    } else if (comic.year !== null && comic.year !== undefined) {
      allYears.add(comic.year);
    }

    if (comic.title) {
      const normalizedTitle = comic.title.trim();
      if (normalizedTitle) {
        const startingLetter = normalizedTitle.charAt(0).toLowerCase();
        if (/^[a-z]$/.test(startingLetter)) {
          allLetters.add(startingLetter);
        }
      }
    }

    if (comic.series) {
      allSeriesNames.add(comic.series);
    }

    if (comic.language) {
      allLanguages.add(comic.language);
    }
    if (comic.format) {
      allFormats.add(comic.format);
    }
    if (comic.readingDirection) {
      allReadingDirections.add(comic.readingDirection);
    }
    if (comic.ageRating) {
      allAgeRatings.add(comic.ageRating);
    }

    if (comic.libraryId !== null && comic.libraryId !== undefined) {
      allLibraryIds.add(comic.libraryId);
    }
    if (comic.manga !== null && comic.manga !== undefined) {
      allMangaValues.add(comic.manga);
    }
    if (comic.blackAndWhite !== null && comic.blackAndWhite !== undefined) {
      allBlackAndWhiteValues.add(comic.blackAndWhite);
    }
  }

  return {
    years: Array.from(allYears).sort((a, b) => a - b),
    letters: Array.from(allLetters).sort(),
    languages: Array.from(allLanguages).sort(),
    formats: Array.from(allFormats).sort(),
    readingDirections: Array.from(allReadingDirections).sort(),
    ageRatings: Array.from(allAgeRatings).sort(),
    libraryIds: Array.from(allLibraryIds).sort((a, b) => a - b),
    manga: Array.from(allMangaValues).sort((a, b) => a - b),
    blackAndWhite: Array.from(allBlackAndWhiteValues).sort((a, b) => a - b),
    seriesNames: Array.from(allSeriesNames).sort(),
  };
}

/**
 * Compiles all comic-book-level metadata and additional scalar values that are
 * valid filter options for comic-book browsing.
 *
 * This mirrors the series-level filter-values compiler, but aggregates directly
 * from comic books instead of from pre-aggregated series records.
 */
export const compileEntireComicBooksMetadataAndAdditionalComicBookInfo = async (userId: number): Promise<ComicBooksFilterValues> => {
  const queryData: RequestParametersValidated<ComicSortField, ComicFilterField> = {
    pagination: { pageNumber: 1, pageSize: 999999 },
    sort: { sortProperty: "createdAt", sortOrder: "asc" },
    filter: undefined,
  };

  const allComicBooks: ComicBookWithMetadata[] = await fetchComicBooksWithRelatedMetadata(queryData, userId);

  const completeLibraryCredits: ComicBookMetadataOnly = {};

  const creatorCredits: ComicBookMetadataOnly = compileCreatorCredits(allComicBooks);
  const publishingCredits: ComicBookMetadataOnly = compilePublishingCredits(allComicBooks);
  const storyAndWorldCredits: ComicBookMetadataOnly = compileStoryAndWorldCredits(allComicBooks);

  const comicBookLevelFilterValues: ComicBooksFilterValues = compileComicBookLevelFilterValues(allComicBooks);

  Object.assign(completeLibraryCredits, creatorCredits, publishingCredits, storyAndWorldCredits, comicBookLevelFilterValues);

  const totalMetadataFilterValues: ComicBooksFilterValues = {
    ...comicBookLevelFilterValues,
    ...completeLibraryCredits,
  }

  return totalMetadataFilterValues;
};

/**
 * Assembles complete metadata for a batch of comic books by fetching all related metadata in parallel and then combining it into a structured format.
 * @param comicBooks An array of comic books to fetch metadata for
 * @returns An array of comic books with their associated metadata attached
 */
export const assembleComicBookMetadataBatch = async (
  comicBooks: ComicBook[],
): Promise<Partial<ComicBookWithMetadata>[]> => {
  const comicBookIds: number[] = comicBooks.map((comic) => comic.id);
  const metadataList: BatchMetadataResult = await getMetadataForComicBooksBatch(comicBookIds);

  const comicsWithMetadata: Partial<ComicBookWithMetadata>[] = [];

  for (const comic of comicBooks) {
    const metadata: ComicBookMetadata = metadataList[comic.id];
    comicsWithMetadata.push({
      ...comic,
      writers: metadata?.writers || [],
      pencilers: metadata?.pencilers || [],
      inkers: metadata?.inkers || [],
      letterers: metadata?.letterers || [],
      editors: metadata?.editors || [],
      colorists: metadata?.colorists || [],
      coverArtists: metadata?.coverArtists || [],
      publishers: metadata?.publishers || [],
      imprints: metadata?.imprints || [],
      genres: metadata?.genres || [],
      characters: metadata?.characters || [],
      teams: metadata?.teams || [],
      locations: metadata?.locations || [],
      storyArcs: metadata?.storyArcs || [],
      seriesGroups: metadata?.seriesGroups || [],
    });

  }

  return comicsWithMetadata;
};