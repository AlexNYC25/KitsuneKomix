import { queueLogger } from "#logger/loggers.ts";

import { updateIngestionRecordState } from "#infrastructure/db/sqlite/models/comicBookIngestion.model.ts";
import { getComicMetadataCandidatesByComicBookId } from "#infrastructure/db/sqlite/models/comicMetadataCandidates.model.ts";
import { addComicBookToSeries } from "#infrastructure/db/sqlite/models/comicSeries.model.ts";
import { linkGenreToComicBook } from "#infrastructure/db/sqlite/models/comicGenres.model.ts";
import { linkPublisherToComicBook } from "#infrastructure/db/sqlite/models/comicPublishers.model.ts";
import { linkImprintToComicBook } from "#infrastructure/db/sqlite/models/comicImprints.model.ts";
import { linkWriterToComicBook } from "#infrastructure/db/sqlite/models/comicWriters.model.ts";
import { linkPencilerToComicBook } from "#infrastructure/db/sqlite/models/comicPencilers.model.ts";
import { linkInkerToComicBook } from "#infrastructure/db/sqlite/models/comicInkers.model.ts";
import { linkColoristToComicBook } from "#infrastructure/db/sqlite/models/comicColorists.model.ts";
import { linkLettererToComicBook } from "#infrastructure/db/sqlite/models/comicLetterers.model.ts";
import { linkCoverArtistToComicBook } from "#infrastructure/db/sqlite/models/comicCoverArtists.model.ts";
import { linkEditorToComicBook } from "#infrastructure/db/sqlite/models/comicEditors.model.ts";
import { linkCharacterToComicBook } from "#infrastructure/db/sqlite/models/comicCharacters.model.ts";
import { linkTeamToComicBook } from "#infrastructure/db/sqlite/models/comicTeams.model.ts";
import { linkLocationToComicBook } from "#infrastructure/db/sqlite/models/comicLocations.model.ts";
import { linkStoryArcToComicBook } from "#infrastructure/db/sqlite/models/comicStoryArcs.model.ts";
import { linkSeriesGroupToComicBook } from "#infrastructure/db/sqlite/models/comicSeriesGroups.model.ts";

import type { JobHandler, JobHandlerResult, ComicBookIngestion, ComicMetadataCandidate} from "#types/index.ts";


/**
 * Handles the COMIC_LINKS_BUILT stage of comic ingestion.
 * 
 * Responsibilities:
 * - Link the comic book to resolved entities (writers, artists, series, etc.)
 * - Create relationship records in junction tables
 * - Move to COMIC_METADATA_AGGREGATED state
 * 
 */
export class ComicLinksBuilderHandler implements JobHandler {
  async handle(record: ComicBookIngestion): Promise<JobHandlerResult> {
    try {
      if (!record.id) {
        return {
          success: false,
          errorMessage: "Missing comic book ID in metadata",
        };
      }

      const metadataCandidatesToProcess: ComicMetadataCandidate[] =
        await getComicMetadataCandidatesByComicBookId(record.id, "accepted");

      if (metadataCandidatesToProcess.length === 0) {
        queueLogger.info(
          `[MetadataEntitiesResolutionHandler] No pending candidates to resolve`,
        );
      }

      for (const candidate of metadataCandidatesToProcess) {
        switch (candidate.type) {
          case "series": 
            await linkComicSeriesCandidate(candidate);
            break;
          case "genre":
            await linkComicGenreCandidate(candidate);
            break;
          case "publisher":
            await linkComicPublisherCandidate(candidate);
            break;
          case "imprint":
            await linkComicImprintCandidate(candidate);
            break;
          case "writer":
            await linkComicWriterCandidate(candidate);
            break;
          case "penciler":
            await linkComicPencilerCandidate(candidate);
            break;
          case "inker":
            await linkComicInkerCandidate(candidate);
            break;
          case "colorist":
            await linkComicColoristCandidate(candidate);
            break;
          case "letterer":
            await linkComicLettererCandidate(candidate);
            break;
          case "cover_artist":
            await linkComicCoverArtistCandidate(candidate);
            break;
          case "editor":
            await linkComicEditorCandidate(candidate);
            break;
          case "character":
            await linkComicCharacterCandidate(candidate);
            break;
          case "team":
            await linkComicTeamCandidate(candidate);
            break;
          case "location":
            await linkComicLocationCandidate(candidate);
            break;
          case "story_arc":
            await linkComicStoryArcCandidate(candidate);
            break;
          case "series_group":
            await linkComicSeriesGroupCandidate(candidate);
            break;
          default: {
            queueLogger.warn(
              `[ComicLinksBuilderHandler] Unknown candidate type: ${candidate.type} for candidate ID: ${candidate.id}`,
            );
          }
        }
      }


      const newStateRecord: Partial<ComicBookIngestion> = {
        state: "COMIC_METADATA_AGGREGATED",
      };

      const _ingestionRecord: ComicBookIngestion =
        await updateIngestionRecordState(
          record.id,
          newStateRecord,
        );



      return {
        success: true,
        data: {
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      queueLogger.error(`[ComicLinksBuilderHandler] Error: ${errorMessage}`);

      return {
        success: false,
        errorMessage,
      };
    }
  }
}

const linkComicSeriesCandidate = async (candidate: ComicMetadataCandidate): Promise<void> => {
  const resolvedSeriesId = candidate.resolvedId;

  if (resolvedSeriesId) {
    const _successfullyLinkedBookToSeries = await addComicBookToSeries(candidate.comicBookId, resolvedSeriesId);
    queueLogger.info(
      `[ComicLinksBuilderHandler] Linked comic book ID ${candidate.comicBookId} to series ID ${resolvedSeriesId} based on candidate ID ${candidate.id}`,
    );
  } else {
    queueLogger.warn(
      `[ComicLinksBuilderHandler] No resolved series ID found for candidate ID ${candidate.id}, cannot link comic book ID ${candidate.comicBookId} to series`,
    );
  }
}

const linkComicGenreCandidate = async (candidate: ComicMetadataCandidate): Promise<void> => {
  const resolvedGenreId = candidate.resolvedId;
  
  if (resolvedGenreId) {
    const _successfullyLinkedGenreToComic = await linkGenreToComicBook(resolvedGenreId, candidate.comicBookId);
    queueLogger.info(
      `[ComicLinksBuilderHandler] Linked comic book ID ${candidate.comicBookId} to genre ID ${resolvedGenreId} based on candidate ID ${candidate.id}`,
    );
  } else {
    queueLogger.warn(
      `[ComicLinksBuilderHandler] No resolved genre ID found for candidate ID ${candidate.id}, cannot link comic book ID ${candidate.comicBookId} to genre`,
    );
  }
}

const linkComicPublisherCandidate = async (candidate: ComicMetadataCandidate): Promise<void> => {
  const resolvedPublisherId = candidate.resolvedId;
  
  if (resolvedPublisherId) {
    // In this case we don't have a separate linking table, we just need to update the comic book record with the publisher ID
    const _successfullyLinkedPublisherToComic = await linkPublisherToComicBook(resolvedPublisherId, candidate.comicBookId);
    queueLogger.info(
      `[ComicLinksBuilderHandler] Linked comic book ID ${candidate.comicBookId} to publisher ID ${resolvedPublisherId} based on candidate ID ${candidate.id}`,
    );
  } else {
    queueLogger.warn(
      `[ComicLinksBuilderHandler] No resolved publisher ID found for candidate ID ${candidate.id}, cannot link comic book ID ${candidate.comicBookId} to publisher`,
    );
  }
}

const linkComicImprintCandidate = async (candidate: ComicMetadataCandidate): Promise<void> => {
  const resolvedImprintId = candidate.resolvedId;
  
  if (resolvedImprintId) {
    const _successfullyLinkedImprintToComic = await linkImprintToComicBook(resolvedImprintId, candidate.comicBookId);
    queueLogger.info(
      `[ComicLinksBuilderHandler] Linked comic book ID ${candidate.comicBookId} to imprint ID ${resolvedImprintId} based on candidate ID ${candidate.id}`,
    );
  } else {
    queueLogger.warn(
      `[ComicLinksBuilderHandler] No resolved imprint ID found for candidate ID ${candidate.id}, cannot link comic book ID ${candidate.comicBookId} to imprint`,
    );
  }
}

const linkComicWriterCandidate = async (candidate: ComicMetadataCandidate): Promise<void> => {
  const resolvedWriterId = candidate.resolvedId;
  
  if (resolvedWriterId) {
    const _successfullyLinkedWriterToComic = await linkWriterToComicBook(resolvedWriterId, candidate.comicBookId);
    queueLogger.info(
      `[ComicLinksBuilderHandler] Linked comic book ID ${candidate.comicBookId} to writer ID ${resolvedWriterId} based on candidate ID ${candidate.id}`,
    );
  } else {
    queueLogger.warn(
      `[ComicLinksBuilderHandler] No resolved writer ID found for candidate ID ${candidate.id}, cannot link comic book ID ${candidate.comicBookId} to writer`,
    );
  }
}

const linkComicPencilerCandidate = async (candidate: ComicMetadataCandidate): Promise<void> => {
  const resolvedPencilerId = candidate.resolvedId;

  if (resolvedPencilerId) {
    const _successfullyLinkedPencilerToComic = await linkPencilerToComicBook(resolvedPencilerId, candidate.comicBookId);
    queueLogger.info(
      `[ComicLinksBuilderHandler] Linked comic book ID ${candidate.comicBookId} to penciler ID ${resolvedPencilerId} based on candidate ID ${candidate.id}`,
    );
  } else {
    queueLogger.warn(
      `[ComicLinksBuilderHandler] No resolved penciler ID found for candidate ID ${candidate.id}, cannot link comic book ID ${candidate.comicBookId} to penciler`,
    );
  }
}

const linkComicInkerCandidate = async (candidate: ComicMetadataCandidate): Promise<void> => {
  const resolvedInkerId = candidate.resolvedId;

  if (resolvedInkerId) {
    const _successfullyLinkedInkerToComic = await linkInkerToComicBook(resolvedInkerId, candidate.comicBookId);
    queueLogger.info(
      `[ComicLinksBuilderHandler] Linked comic book ID ${candidate.comicBookId} to inker ID ${resolvedInkerId} based on candidate ID ${candidate.id}`,
    );
  } else {
    queueLogger.warn(
      `[ComicLinksBuilderHandler] No resolved inker ID found for candidate ID ${candidate.id}, cannot link comic book ID ${candidate.comicBookId} to inker`,
    );
  }
}

const linkComicColoristCandidate = async (candidate: ComicMetadataCandidate): Promise<void> => {
  const resolvedColoristId = candidate.resolvedId;

  if (resolvedColoristId) {
    const _successfullyLinkedColoristToComic = await linkColoristToComicBook(resolvedColoristId, candidate.comicBookId);
    queueLogger.info(
      `[ComicLinksBuilderHandler] Linked comic book ID ${candidate.comicBookId} to colorist ID ${resolvedColoristId} based on candidate ID ${candidate.id}`,
    );
  } else {
    queueLogger.warn(
      `[ComicLinksBuilderHandler] No resolved colorist ID found for candidate ID ${candidate.id}, cannot link comic book ID ${candidate.comicBookId} to colorist`,
    );
  }
}

const linkComicLettererCandidate = async (candidate: ComicMetadataCandidate): Promise<void> => {
  const resolvedLettererId = candidate.resolvedId;

  if (resolvedLettererId) {
    const _successfullyLinkedLettererToComic = await linkLettererToComicBook(resolvedLettererId, candidate.comicBookId);
    queueLogger.info(
      `[ComicLinksBuilderHandler] Linked comic book ID ${candidate.comicBookId} to letterer ID ${resolvedLettererId} based on candidate ID ${candidate.id}`,
    );
  } else {
    queueLogger.warn(
      `[ComicLinksBuilderHandler] No resolved letterer ID found for candidate ID ${candidate.id}, cannot link comic book ID ${candidate.comicBookId} to letterer`,
    );
  }
}

const linkComicCoverArtistCandidate = async (candidate: ComicMetadataCandidate): Promise<void> => {
  const resolvedCoverArtistId = candidate.resolvedId;

  if (resolvedCoverArtistId) {
    const _successfullyLinkedCoverArtistToComic = await linkCoverArtistToComicBook(resolvedCoverArtistId, candidate.comicBookId);
    queueLogger.info(
      `[ComicLinksBuilderHandler] Linked comic book ID ${candidate.comicBookId} to cover artist ID ${resolvedCoverArtistId} based on candidate ID ${candidate.id}`,
    );
  } else {
    queueLogger.warn(
      `[ComicLinksBuilderHandler] No resolved cover artist ID found for candidate ID ${candidate.id}, cannot link comic book ID ${candidate.comicBookId} to cover artist`,
    );
  }
}

const linkComicEditorCandidate = async (candidate: ComicMetadataCandidate): Promise<void> => {
  const resolvedEditorId = candidate.resolvedId;

  if (resolvedEditorId) {
    const _successfullyLinkedEditorToComic = await linkEditorToComicBook(resolvedEditorId, candidate.comicBookId);
    queueLogger.info(
      `[ComicLinksBuilderHandler] Linked comic book ID ${candidate.comicBookId} to editor ID ${resolvedEditorId} based on candidate ID ${candidate.id}`,
    );
  } else {
    queueLogger.warn(
      `[ComicLinksBuilderHandler] No resolved editor ID found for candidate ID ${candidate.id}, cannot link comic book ID ${candidate.comicBookId} to editor`,
    );
  }
}

const linkComicCharacterCandidate = async (candidate: ComicMetadataCandidate): Promise<void> => {
  const resolvedCharacterId = candidate.resolvedId;

  if (resolvedCharacterId) {
    const _successfullyLinkedCharacterToComic = await linkCharacterToComicBook(resolvedCharacterId, candidate.comicBookId);
    queueLogger.info(
      `[ComicLinksBuilderHandler] Linked comic book ID ${candidate.comicBookId} to character ID ${resolvedCharacterId} based on candidate ID ${candidate.id}`,
    );
  } else {
    queueLogger.warn(
      `[ComicLinksBuilderHandler] No resolved character ID found for candidate ID ${candidate.id}, cannot link comic book ID ${candidate.comicBookId} to character`,
    );
  }
}

const linkComicTeamCandidate = async (candidate: ComicMetadataCandidate): Promise<void> => {
  const resolvedTeamId = candidate.resolvedId;

  if (resolvedTeamId) {
    const _successfullyLinkedTeamToComic = await linkTeamToComicBook(resolvedTeamId, candidate.comicBookId);
    queueLogger.info(
      `[ComicLinksBuilderHandler] Linked comic book ID ${candidate.comicBookId} to team ID ${resolvedTeamId} based on candidate ID ${candidate.id}`,
    );
  } else {
    queueLogger.warn(
      `[ComicLinksBuilderHandler] No resolved team ID found for candidate ID ${candidate.id}, cannot link comic book ID ${candidate.comicBookId} to team`,
    );
  }
}

const linkComicLocationCandidate = async (candidate: ComicMetadataCandidate): Promise<void> => {
  const resolvedLocationId = candidate.resolvedId;

  if (resolvedLocationId) {
    const _successfullyLinkedLocationToComic = await linkLocationToComicBook(resolvedLocationId, candidate.comicBookId);
    queueLogger.info(
      `[ComicLinksBuilderHandler] Linked comic book ID ${candidate.comicBookId} to location ID ${resolvedLocationId} based on candidate ID ${candidate.id}`,
    );
  } else {
    queueLogger.warn(
      `[ComicLinksBuilderHandler] No resolved location ID found for candidate ID ${candidate.id}, cannot link comic book ID ${candidate.comicBookId} to location`,
    );
  }
}

const linkComicStoryArcCandidate = async (candidate: ComicMetadataCandidate): Promise<void> => {
  const resolvedStoryArcId = candidate.resolvedId;

  if (resolvedStoryArcId) {
    const _successfullyLinkedStoryArcToComic = await linkStoryArcToComicBook(resolvedStoryArcId, candidate.comicBookId);
    queueLogger.info(
      `[ComicLinksBuilderHandler] Linked comic book ID ${candidate.comicBookId} to story arc ID ${resolvedStoryArcId} based on candidate ID ${candidate.id}`,
    );
  } else {
    queueLogger.warn(
      `[ComicLinksBuilderHandler] No resolved story arc ID found for candidate ID ${candidate.id}, cannot link comic book ID ${candidate.comicBookId} to story arc`,
    );
  }
}

const linkComicSeriesGroupCandidate = async (candidate: ComicMetadataCandidate): Promise<void> => {
  const resolvedSeriesGroupId = candidate.resolvedId;
  
  if (resolvedSeriesGroupId) {
    const _successfullyLinkedSeriesGroupToComic = await linkSeriesGroupToComicBook(resolvedSeriesGroupId, candidate.comicBookId);
    queueLogger.info(
      `[ComicLinksBuilderHandler] Linked comic book ID ${candidate.comicBookId} to series group ID ${resolvedSeriesGroupId} based on candidate ID ${candidate.id}`,
    );
  } else {
    queueLogger.warn(
      `[ComicLinksBuilderHandler] No resolved series group ID found for candidate ID ${candidate.id}, cannot link comic book ID ${candidate.comicBookId} to series group`,
    );
  }

}