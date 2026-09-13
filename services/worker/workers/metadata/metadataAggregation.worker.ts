import { 
  getQueue,
  type QueueJob, 
  type QueueType 
} from "kitsune-komix-database"
import type { MetadataExtractionPayload } from "../../shared/types/payload.types";
import { workerLogger } from "../../loggers";
import { consolidateComicMetadata } from "../../utilities/metadata/metadataConsolidation";
import { aggregateComicBookMetadataIntoSeries } from "../../services/comicSeriesMetadata.service";
import type {
  ConsolidatedComicMetadata,
  SeriesAggregationResult,
} from "../../shared/types/utilities.types";

export class MetadataAggregationWorker {
  queue: null | QueueType = null;

  async dequeue() {
    if (!this.queue) {
      this.queue = await getQueue("COMIC_METADATA_AGGREGATION");
    }

    const job: QueueJob | null = this.queue.claimOne("comic_metadata_aggregation_worker");

    return job;
  }
    
  async start() {
    workerLogger.info("comic metadata aggregation worker has started")
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
      if (!currentPayload.seriesId) {
        workerLogger.info(
          `Skipping series metadata aggregation for comic book ${currentPayload.comicBookId}: no series associated.`,
        )
        return
      }

      const consolidatedMetadata: ConsolidatedComicMetadata =
        consolidateComicMetadata(currentPayload.metadata)

      const aggregationResult: SeriesAggregationResult =
        await aggregateComicBookMetadataIntoSeries(
          currentPayload.seriesId,
          consolidatedMetadata,
        )

      workerLogger.info(
        `Aggregated metadata for comic book ${currentPayload.comicBookId} into series ${currentPayload.seriesId}: ${JSON.stringify(aggregationResult)}`,
      )
    } catch (error) {
      workerLogger.error(
        `There was an error aggregating metadata for comic book ${currentPayload.comicBookId}: ${error}`,
      )
    } finally {
      job.ack()
    }
  }
}