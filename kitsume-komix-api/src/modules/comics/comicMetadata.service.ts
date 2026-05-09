import { getClient } from "#infrastructure/db/sqlite/client.ts";
import { getThumbnailsByComicBookId } from "#infrastructure/db/sqlite/models/comicBookThumbnails.model.ts";
import { getFileNameFromPath } from "#utilities/file.ts";

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
  ComicBookMetadataOnly,
  ComicMetadataUpdateData,
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

    const thumbnail = await getThumbnailsByComicBookId(id);
    const thumbnailUrl = thumbnail && thumbnail.length > 0
      ? `/api/image/thumbnails/${getFileNameFromPath(thumbnail[0].filePath)}`
      : undefined;

    return {
      ...metadata,
      thumbnailUrl,
    };
  } catch (error) {
    console.error("Error fetching comic book metadata:", error);
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
          console.error(
            `Error unlinking ${updateType} from comic book:`,
            error,
          );
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
        console.error(`Error updating ${updateType} for comic book:`, error);
        throw error;
      }
    }

    return true;
  } catch (error) {
    console.error("Error updating comic book metadata:", error);
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
        console.error(`Failed to update metadata for comic ID ${comicId}`);
        return numberOfSuccessfulUpdates;
      } else {
        numberOfSuccessfulUpdates++;
      }
    }
    return numberOfSuccessfulUpdates;
  } catch (error) {
    console.error("Error updating comic book metadata in bulk:", error);
    return 0;
  }
};