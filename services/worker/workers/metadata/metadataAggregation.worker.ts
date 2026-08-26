import { 
  getQueue,
  type QueueJob, 
  type QueueType 
} from "kitsune-komix-database"
import type { MetadataExtractionPayload } from "../../shared/types/payload.types";
import { workerLogger } from "../../loggers";

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
    console.log("comic metadata aggregation worker has started")
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
      // TODO: Iterate through the keys of the metadata object, and if there were new
      // values added to the comic books metadata, then set a process to aggregate 
      // metadata values across all comic books in the series and update the series metadata accordingly.
    } catch {
      workerLogger.error("There was an error processing the metadata aggregation job for the comic book")
    } finally {
      job.ack();
    }
  }
}