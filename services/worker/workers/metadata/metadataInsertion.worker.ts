import type { MetadataCompiled } from "comic-metadata-tool"
import { 
  getQueue,
  type QueueJob, 
  type QueueType
} from "kitsune-komix-database"
import type { MetadataExtractionPayload } from "../../shared/types/payload.types";
import { workerLogger } from "../../loggers";
import { consolidateComicMetadata } from "../../utilities/metadata/metadataConsolidation";
import { insertComicBookMetadata } from "../../services/comicMetadata.service";
import type {
  ComicMetadataInsertionResult,
  ConsolidatedComicMetadata,
} from "../../shared/types/utilities.types";

export class MetadataInsertionWorker {
  queue: null | QueueType = null;

  metadataQueue: null | QueueType = null;

  async dequeue() {
    if (!this.queue) {
      this.queue = await getQueue("COMICINFO_METADATA_CREATION");
    }

    const job: QueueJob | null = this.queue.claimOne("comicinfo_metadata_creation_worker");

    return job;
  }
    
  async start() {
    workerLogger.info("comicinfo metadata creation worker has started")
    while (true) {
      const job: QueueJob | null = await this.dequeue();

      if (!job) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        continue;
      }

      await this.processJob(job);
    }
  }

  async processJob(job: QueueJob) {
    const currentPayload = job.payload as MetadataExtractionPayload

    try {
      const metadata: MetadataCompiled = currentPayload.metadata

      const consolidatedMetadata: ConsolidatedComicMetadata =
        consolidateComicMetadata(metadata)

      const insertionResult: ComicMetadataInsertionResult =
        await insertComicBookMetadata(currentPayload.comicBookId, consolidatedMetadata)

      if (!this.metadataQueue) {
        this.metadataQueue = await getQueue("COMIC_METADATA_AGGREGATION");
      }

      const nextPayload: MetadataExtractionPayload = {
        ...currentPayload,
        metadata: metadata,
      }

      this.metadataQueue.enqueue(nextPayload)

      workerLogger.info(
        `Inserted metadata for comic book ${currentPayload.comicBookId}: ${JSON.stringify(insertionResult)}`,
      )
    } catch (error) {
      workerLogger.error(
        `There was an error inserting metadata for comic book ${currentPayload.comicBookId}: ${error}`,
      )
    } finally {
      job.ack()
    }
  }
}