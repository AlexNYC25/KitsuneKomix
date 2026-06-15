import { queueLogger } from "#logger/loggers.ts";

import { getByIdTemplate } from "#infrastructure/db/sqlite/models/templates/comicbooks.model.templates.ts";
import {
  updateIngestionRecordState,
} from "#infrastructure/db/sqlite/models/comicBookIngestion.model.ts";
import {
  getComicMetadataCandidatesByComicBookId,
  updatedComicMetadataCandidateStatus,
} from "#infrastructure/db/sqlite/models/comicMetadataCandidates.model.ts";
import { getComicBooksWithMetadataFilteringSorting } from "#infrastructure/db/sqlite/models/comicBooks.model.ts";
import { getComicSeriesByPath, insertComicSeries } from "#infrastructure/db/sqlite/models/comicSeries.model.ts";
import { insertComicGenre } from "#infrastructure/db/sqlite/models/comicGenres.model.ts"
import { insertComicPublisher } from "#infrastructure/db/sqlite/models/comicPublishers.model.ts";
import { insertComicImprint } from "#infrastructure/db/sqlite/models/comicImprints.model.ts";
import { insertComicWriter } from "#infrastructure/db/sqlite/models/comicWriters.model.ts";
import { insertComicPenciler } from "#infrastructure/db/sqlite/models/comicPencilers.model.ts";
import { insertComicInker } from "#infrastructure/db/sqlite/models/comicInkers.model.ts";
import { insertComicColorist } from "#infrastructure/db/sqlite/models/comicColorists.model.ts";
import { insertComicLetterer } from "#infrastructure/db/sqlite/models/comicLetterers.model.ts";
import { insertComicCoverArtist } from "#infrastructure/db/sqlite/models/comicCoverArtists.model.ts";
import { insertComicEditor } from "#infrastructure/db/sqlite/models/comicEditors.model.ts";
import { insertComicCharacter } from "#infrastructure/db/sqlite/models/comicCharacters.model.ts";
import { insertComicTeam } from "#infrastructure/db/sqlite/models/comicTeams.model.ts";
import { insertComicLocation } from "#infrastructure/db/sqlite/models/comicLocations.model.ts";
import { insertComicStoryArc } from "#infrastructure/db/sqlite/models/comicStoryArcs.model.ts";
import { insertComicSeriesGroup } from "#infrastructure/db/sqlite/models/comicSeriesGroups.model.ts";


import { getFolderPathFromFilePath } from "#utilities/file.ts";

import type {
  ComicBook,
  ComicSeries,
  NewComicSeries,
  ComicBookFilteringAndSortingParams,
  ComicBookIngestion,
  ComicMetadataCandidate,
  MetadataCandidateStatus,
  JobHandler,
  JobHandlerResult,
} from "#types/index.ts";

/**
 * Handles the METADATA_ENTITIES_RESOLVED stage of comic ingestion.
 *
 * Responsibilities:
 * - Process pending metadata candidates
 * - For each candidate, find or create the corresponding entity
 * - Update candidates with resolved entity IDs
 * - Mark candidates as "accepted" when resolved
 * - Move to COMIC_LINKS_BUILT state
 */
export class MetadataEntitiesResolutionHandler implements JobHandler {
  async handle(record: ComicBookIngestion): Promise<JobHandlerResult> {
    try {
      if (!record.id) {
        return {
          success: false,
          errorMessage: "Missing comic book ID in metadata",
        };
      }

      const metadataCandidatesToProcess: ComicMetadataCandidate[] =
        await getComicMetadataCandidatesByComicBookId(record.id, "pending");

      if (metadataCandidatesToProcess.length === 0) {
        queueLogger.info(
          `[MetadataEntitiesResolutionHandler] No pending candidates to resolve`,
        );
      }

      for (const candidate of metadataCandidatesToProcess) {
        switch (candidate.type) {
          case "series":
            await resolveSeriesCandidate(candidate);
            break;
          case "genre":
            await resolveGenreCandidate(candidate);
            break;
          case "publisher":
            await resolvePublisherCandidate(candidate);
            break;
          case "imprint":
            await resolveImprintCandidate(candidate);
            break;
          case "writer":
            await resolveWriterCandidate(candidate);
            break;
          case "penciler":
            await resolvePencilerCandidate(candidate);
            break;
          case "inker":
            await resolveInkerCandidate(candidate);
            break;
          case "colorist":
            await resolveColoristCandidate(candidate);
            break;
          case "letterer":
            await resolveLettererCandidate(candidate);
            break;
          case "cover_artist":
            await resolveCoverArtistCandidate(candidate);
            break;
          case "editor":
            await resolveEditorCandidate(candidate);
            break;
          case "character":
            await resolveCharacterCandidate(candidate);
            break;
          case "team":
            await resolveTeamCandidate(candidate);
            break;
          case "location":
            await resolveLocationCandidate(candidate);
            break;
          case "story_arc":
            await resolveStoryArcCandidate(candidate);
            break;
          case "series_group":
            await resolveSeriesGroupCandidate(candidate);
            break;
          default:
            queueLogger.warn(
              `[MetadataEntitiesResolutionHandler] Unknown candidate type: ${candidate.type} for candidate ID: ${candidate.id}`,
            );
        }
      }

      queueLogger.info(
        `[MetadataEntitiesResolutionHandler] Finished processing ${metadataCandidatesToProcess.length} candidates for record ID: ${record.id}`,
      );

      // Update ingestion record to next state
      const newStateRecord: Partial<ComicBookIngestion> = {
        state: "COMIC_LINKS_BUILT",
      };

      const _ingestionRecord: ComicBookIngestion =
        await updateIngestionRecordState(
          record.id,
          newStateRecord,
        );

      return {
        success: true,
        data: {
          candidatesProcessed: metadataCandidatesToProcess.length,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      queueLogger.error(
        `[MetadataEntitiesResolutionHandler] Error: ${errorMessage}`,
      );

      return {
        success: false,
        errorMessage,
      };
    }
  }
}

const resolveSeriesCandidate = async (
  candidate: ComicMetadataCandidate,
): Promise<void> => {
  const getComicBookById: ComicBookFilteringAndSortingParams = getByIdTemplate(
    candidate.comicBookId,
  );
  // first we get the comic book record using the candidate.id
  const comicBookRecordsFetched: ComicBook[] =
    await getComicBooksWithMetadataFilteringSorting(getComicBookById);

  const comicBookRecord: ComicBook = comicBookRecordsFetched[0];

  // then we use the record to get the file path of the comic book
  const filePathOfTheComicBook: string = comicBookRecord.filePath;

  const fileFolderPath: string = getFolderPathFromFilePath(filePathOfTheComicBook);

  // then we use the file path to find the comic series that matches the file path
  const currentSeriesMatch: ComicSeries | null = await getComicSeriesByPath(
    fileFolderPath,
  );

  // if we find a match, we update the candidate with the series ID and mark it as accepted
  // NOTE: We may also what to check if the comic book that causes this resolution is the first issue or the earliest available issue of the series on the server, to avoid inconsistencies where a set of books could have different series names due to metadata differences, but are all actually part of the same series.
  if (
    currentSeriesMatch &&
    currentSeriesMatch.name.toLowerCase() ===
      candidate.normalizedValue.toLowerCase()
  ) {
    await updatedComicMetadataCandidateStatus(
      candidate.id,
      "accepted",
      currentSeriesMatch.id,
    );

    queueLogger.info(
      `[MetadataEntitiesResolutionHandler] Resolved series candidate ID: ${candidate.id} to series ID: ${currentSeriesMatch.id}`,
    );

    return;
  }

  // if we don't find a match, we create a new series record, update the candidate with the new series ID and mark it as accepted
  const newSeriesRecord: NewComicSeries = {
    name: candidate.normalizedValue,
    folderPath: fileFolderPath,
  }

  const newSeriesId: number = await insertComicSeries(newSeriesRecord);

  await updatedComicMetadataCandidateStatus(
    candidate.id,
    "accepted" as MetadataCandidateStatus,
    newSeriesId,
  );

  queueLogger.info(
    `[MetadataEntitiesResolutionHandler] Created new series and resolved series candidate ID: ${candidate.id} to new series ID: ${newSeriesId}`,
  );
};

const resolveGenreCandidate = async (
  candidate: ComicMetadataCandidate,
): Promise<void> => {
  try {
    // This function either adds a new genre or returns the existing genre ID if the genre already exists
    const newGenreId: number = await insertComicGenre(candidate.normalizedValue);

    await updatedComicMetadataCandidateStatus(
      candidate.id,
      "accepted" as MetadataCandidateStatus,
      newGenreId,
    );
  } catch (error) {
    queueLogger.error(
      `[MetadataEntitiesResolutionHandler] Error resolving genre candidate ID: ${candidate.id} with value: ${candidate.normalizedValue}. Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

const resolvePublisherCandidate = async (
  candidate: ComicMetadataCandidate,
): Promise<void> => {
  try {
    const newPublisherId: number = await insertComicPublisher(candidate.normalizedValue);
    
    await updatedComicMetadataCandidateStatus(
      candidate.id,
      "accepted" as MetadataCandidateStatus,
      newPublisherId,
    );
  } catch (error) {
    queueLogger.error(
      `[MetadataEntitiesResolutionHandler] Error resolving publisher candidate ID: ${candidate.id} with value: ${candidate.normalizedValue}. Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

const resolveImprintCandidate = async (
  candidate: ComicMetadataCandidate,
): Promise<void> => {
  try {
    const newImprintId: number = await insertComicImprint(candidate.normalizedValue);

    await updatedComicMetadataCandidateStatus(
      candidate.id,
      "accepted" as MetadataCandidateStatus,
      newImprintId,
    );
  } catch (error) {
    queueLogger.error(
      `[MetadataEntitiesResolutionHandler] Error resolving writer candidate ID: ${candidate.id} with value: ${candidate.normalizedValue}. Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

const resolveWriterCandidate = async (
  candidate: ComicMetadataCandidate,
): Promise<void> => {
  try {
    const newWriterId: number = await insertComicWriter(candidate.normalizedValue);

    await updatedComicMetadataCandidateStatus(
      candidate.id,
      "accepted" as MetadataCandidateStatus,
      newWriterId,
    );
  } catch (error) {
    queueLogger.error(
      `[MetadataEntitiesResolutionHandler] Error resolving writer candidate ID: ${candidate.id} with value: ${candidate.normalizedValue}. Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
  
};

const resolvePencilerCandidate = async (
  candidate: ComicMetadataCandidate,
): Promise<void> => {
  try {
    const newPencilerId: number = await insertComicPenciler(candidate.normalizedValue);

    await updatedComicMetadataCandidateStatus(
      candidate.id,
      "accepted" as MetadataCandidateStatus,
      newPencilerId,
    );
  } catch (error) {
    queueLogger.error(
      `[MetadataEntitiesResolutionHandler] Error resolving penciler candidate ID: ${candidate.id} with value: ${candidate.normalizedValue}. Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

const resolveInkerCandidate = async (
  candidate: ComicMetadataCandidate,
): Promise<void> => {
  try {
    const newInkerId: number = await insertComicInker(candidate.normalizedValue);
    
    await updatedComicMetadataCandidateStatus(
      candidate.id,
      "accepted" as MetadataCandidateStatus,
      newInkerId,
    );
  } catch (error) {
    queueLogger.error(
      `[MetadataEntitiesResolutionHandler] Error resolving inker candidate ID: ${candidate.id} with value: ${candidate.normalizedValue}. Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

const resolveColoristCandidate = async (
  candidate: ComicMetadataCandidate,
): Promise<void> => {
  try {
    const newColoristId: number = await insertComicColorist(candidate.normalizedValue);

    await updatedComicMetadataCandidateStatus(
      candidate.id,
      "accepted" as MetadataCandidateStatus,
      newColoristId,
    );
  } catch (error) {
    queueLogger.error(
      `[MetadataEntitiesResolutionHandler] Error resolving colorist candidate ID: ${candidate.id} with value: ${candidate.normalizedValue}. Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

const resolveLettererCandidate = async (
  candidate: ComicMetadataCandidate,
): Promise<void> => {
  try {
    const newLettererId: number = await insertComicLetterer(candidate.normalizedValue);

    await updatedComicMetadataCandidateStatus(
      candidate.id,
      "accepted" as MetadataCandidateStatus,
      newLettererId,
    );
  } catch (error) {
    queueLogger.error(
      `[MetadataEntitiesResolutionHandler] Error resolving letterer candidate ID: ${candidate.id} with value: ${candidate.normalizedValue}. Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

const resolveCoverArtistCandidate = async (
  candidate: ComicMetadataCandidate,
): Promise<void> => {
  try {
    const newCoverArtistId: number = await insertComicCoverArtist(candidate.normalizedValue);

    await updatedComicMetadataCandidateStatus(
      candidate.id,
      "accepted" as MetadataCandidateStatus,
      newCoverArtistId,
    );
  } catch (error) {
    queueLogger.error(
      `[MetadataEntitiesResolutionHandler] Error resolving cover artist candidate ID: ${candidate.id} with value: ${candidate.normalizedValue}. Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

const resolveEditorCandidate = async (
  candidate: ComicMetadataCandidate,
): Promise<void> => {
  try {
    const newEditorId: number = await insertComicEditor(candidate.normalizedValue);

    await updatedComicMetadataCandidateStatus(
      candidate.id,
      "accepted" as MetadataCandidateStatus,
      newEditorId,
    );
  } catch (error) {
    queueLogger.error(
      `[MetadataEntitiesResolutionHandler] Error resolving editor candidate ID: ${candidate.id} with value: ${candidate.normalizedValue}. Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

const resolveCharacterCandidate = async (
  candidate: ComicMetadataCandidate,
): Promise<void> => {
  try {
    const newCharacterId: number = await insertComicCharacter(candidate.normalizedValue);

    await updatedComicMetadataCandidateStatus(
      candidate.id,
      "accepted" as MetadataCandidateStatus,
      newCharacterId,
    );
  } catch (error) {
    queueLogger.error(
      `[MetadataEntitiesResolutionHandler] Error resolving character candidate ID: ${candidate.id} with value: ${candidate.normalizedValue}. Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

const resolveTeamCandidate = async (
  candidate: ComicMetadataCandidate,
): Promise<void> => {
  try {
    const newTeamId: number = await insertComicTeam(candidate.normalizedValue);

    await updatedComicMetadataCandidateStatus(
      candidate.id,
      "accepted" as MetadataCandidateStatus,
      newTeamId,
    );
  } catch (error) {
    queueLogger.error(
      `[MetadataEntitiesResolutionHandler] Error resolving team candidate ID: ${candidate.id} with value: ${candidate.normalizedValue}. Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

const resolveLocationCandidate = async (
  candidate: ComicMetadataCandidate,
): Promise<void> => {
  try {
    const newLocationId: number = await insertComicLocation(candidate.normalizedValue);

    await updatedComicMetadataCandidateStatus(
      candidate.id,
      "accepted" as MetadataCandidateStatus,
      newLocationId,
    );
  } catch (error) {
    queueLogger.error(
      `[MetadataEntitiesResolutionHandler] Error resolving location candidate ID: ${candidate.id} with value: ${candidate.normalizedValue}. Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

const resolveStoryArcCandidate = async (
  candidate: ComicMetadataCandidate,
): Promise<void> => {
  try {
    const newStoryArcId: number = await insertComicStoryArc(candidate.normalizedValue);

    await updatedComicMetadataCandidateStatus(
      candidate.id,
      "accepted" as MetadataCandidateStatus,
      newStoryArcId,
    );
  } catch (error) {
    queueLogger.error(
      `[MetadataEntitiesResolutionHandler] Error resolving story arc candidate ID: ${candidate.id} with value: ${candidate.normalizedValue}. Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

const resolveSeriesGroupCandidate = async (
  candidate: ComicMetadataCandidate,
): Promise<void> => {
  try {
    const newSeriesGroupId: number = await insertComicSeriesGroup(candidate.normalizedValue);

    await updatedComicMetadataCandidateStatus(
      candidate.id,
      "accepted" as MetadataCandidateStatus,
      newSeriesGroupId,
    );
  } catch (error) {
    queueLogger.error(
      `[MetadataEntitiesResolutionHandler] Error resolving series group candidate ID: ${candidate.id} with value: ${candidate.normalizedValue}. Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};
