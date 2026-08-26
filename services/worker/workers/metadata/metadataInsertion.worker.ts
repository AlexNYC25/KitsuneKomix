import { 
  getQueue,
  type QueueJob, 
  type QueueType 
} from "kitsune-komix-database"
import type { MetadataExtractionPayload } from "../../shared/types/payload.types";
import { workerLogger } from "../../loggers";

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

    // TODO: Insert the metadata into the database and associate it with the comic book record

    try {
      if (!this.metadataQueue) {
        this.metadataQueue = await getQueue("COMIC_METADATA_AGGREGATION");
      }

      this.metadataQueue.enqueue(currentPayload)
    } catch {

    } finally {
      job.ack()
    }
  }
}