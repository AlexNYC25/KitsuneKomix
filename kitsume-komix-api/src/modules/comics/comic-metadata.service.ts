import { apiLogger } from "#logger/loggers.ts";
import { getClient } from "#infrastructure/db/sqlite/client.ts";
import { fetchComicBooksWithRelatedMetadata } from "./comic-books.service.ts";

import {
  getWritersByComicBookId,
  insertComicWriter,
  linkWriterToComicBook,
  unlinkWritersToComicBook,
  getPencillersByComicBookId,
  insertComicPenciller,
  linkPencillerToComicBook,
  unlinkPencillersToComicBook,
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
  getSeriesGroupsByComicBookId,
  unlinkSeriesGroupsToComicBook,
} from "#infrastructure/db/sqlite/models/comicMetadataImports.ts";

import type {
  ComicBookWithMetadata,
  ComicFilterField,
  ComicSortField,
  ComicBookMetadataOnly,
  ComicMetadataUpdateData,
  RequestParametersValidated,
} from "#types/index.ts";

type ComicBooksFilterValues = ComicBookMetadataOnly & {
  letters?: string[];
  years?: number[];
  languages?: string[];
  formats?: string[];
  readingDirections?: string[];
  ageRatings?: string[];
  libraryIds?: number[];
  manga?: number[];
  blackAndWhite?: number[];
};

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
 * // Returns: { writers: [...], pencillers: [...], publishers: [...], ... }
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
      pencillers: await getPencillersByComicBookId(id),
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
      seriesGroups: await getSeriesGroupsByComicBookId(id),
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
            case "pencillers":
              await unlinkPencillersToComicBook(comicId);
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
            case "seriesGroups":
              await unlinkSeriesGroupsToComicBook(comicId);
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
            case "pencillers": {
              metadataId = await insertComicPenciller(value);
              await linkPencillerToComicBook(metadataId, comicId);
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
 * Compiles all comic-book-level metadata and additional scalar values that are
 * valid filter options for comic-book browsing.
 *
 * This mirrors the series-level filter-values compiler, but aggregates directly
 * from comic books instead of from pre-aggregated series records.
 */
export const compileEntireComicBooksMetadataAndAdditionalComicBookInfo = async (): Promise<ComicBooksFilterValues> => {
  const queryData: RequestParametersValidated<ComicSortField, ComicFilterField> = {
    pagination: { pageNumber: 1, pageSize: 999999 },
    sort: { sortProperty: "createdAt", sortOrder: "asc" },
    filter: undefined,
  };

  const allComicBooks: ComicBookWithMetadata[] = await fetchComicBooksWithRelatedMetadata(queryData);

  const allYears = new Set<number>();
  const allLetters = new Set<string>();
  const allLanguages = new Set<string>();
  const allFormats = new Set<string>();
  const allReadingDirections = new Set<string>();
  const allAgeRatings = new Set<string>();
  const allLibraryIds = new Set<number>();
  const allMangaValues = new Set<number>();
  const allBlackAndWhiteValues = new Set<number>();

  const completeLibraryCredits: ComicBookMetadataOnly = {};

  for (const comic of allComicBooks) {
    const normalizedTitle = comic.title?.trim();
    if (normalizedTitle) {
      const startingLetter = normalizedTitle.charAt(0).toLowerCase();
      if (/^[a-z]$/.test(startingLetter)) {
        allLetters.add(startingLetter);
      }
    }

    if (comic.publicationDate) {
      const publicationYear = new Date(comic.publicationDate).getFullYear();
      if (!Number.isNaN(publicationYear)) {
        allYears.add(publicationYear);
      }
    } else if (comic.year !== null && comic.year !== undefined) {
      allYears.add(comic.year);
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

    if (comic.writers) {
      completeLibraryCredits.writers = (completeLibraryCredits.writers || []).concat(comic.writers);
    }
    if (comic.pencillers) {
      completeLibraryCredits.pencillers = (completeLibraryCredits.pencillers || []).concat(comic.pencillers);
    }
    if (comic.inkers) {
      completeLibraryCredits.inkers = (completeLibraryCredits.inkers || []).concat(comic.inkers);
    }
    if (comic.letterers) {
      completeLibraryCredits.letterers = (completeLibraryCredits.letterers || []).concat(comic.letterers);
    }
    if (comic.editors) {
      completeLibraryCredits.editors = (completeLibraryCredits.editors || []).concat(comic.editors);
    }
    if (comic.colorists) {
      completeLibraryCredits.colorists = (completeLibraryCredits.colorists || []).concat(comic.colorists);
    }
    if (comic.coverArtists) {
      completeLibraryCredits.coverArtists = (completeLibraryCredits.coverArtists || []).concat(comic.coverArtists);
    }
    if (comic.publishers) {
      completeLibraryCredits.publishers = (completeLibraryCredits.publishers || []).concat(comic.publishers);
    }
    if (comic.imprints) {
      completeLibraryCredits.imprints = (completeLibraryCredits.imprints || []).concat(comic.imprints);
    }
    if (comic.genres) {
      completeLibraryCredits.genres = (completeLibraryCredits.genres || []).concat(comic.genres);
    }
    if (comic.characters) {
      completeLibraryCredits.characters = (completeLibraryCredits.characters || []).concat(comic.characters);
    }
    if (comic.teams) {
      completeLibraryCredits.teams = (completeLibraryCredits.teams || []).concat(comic.teams);
    }
    if (comic.locations) {
      completeLibraryCredits.locations = (completeLibraryCredits.locations || []).concat(comic.locations);
    }
    if (comic.storyArcs) {
      completeLibraryCredits.storyArcs = (completeLibraryCredits.storyArcs || []).concat(comic.storyArcs);
    }
    if (comic.seriesGroups) {
      completeLibraryCredits.seriesGroups = (completeLibraryCredits.seriesGroups || []).concat(comic.seriesGroups);
    }
  }

  const dedupeById = <T extends { id: number | string }>(items: T[]): T[] => {
    const uniqueCredits = new Map<number | string, T>();
    for (const credit of items) {
      uniqueCredits.set(credit.id, credit);
    }
    return Array.from(uniqueCredits.values());
  };

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

  return {
    ...completeLibraryCredits,
    letters: Array.from(allLetters).sort((a, b) => a.localeCompare(b)),
    years: Array.from(allYears).sort((a, b) => a - b),
    languages: Array.from(allLanguages).sort((a, b) => a.localeCompare(b)),
    formats: Array.from(allFormats).sort((a, b) => a.localeCompare(b)),
    readingDirections: Array.from(allReadingDirections).sort((a, b) => a.localeCompare(b)),
    ageRatings: Array.from(allAgeRatings).sort((a, b) => a.localeCompare(b)),
    libraryIds: Array.from(allLibraryIds).sort((a, b) => a - b),
    manga: Array.from(allMangaValues),
    blackAndWhite: Array.from(allBlackAndWhiteValues),
  };
};