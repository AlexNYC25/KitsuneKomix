import {
  readComicFileMetadata,
  type MetadataCompiled
} from "comic-metadata-tool"

import {
  getQueue,
  type QueueJob, 
  type QueueType 
} from "kitsune-komix-database";
import type { IngestionToSecondaryPipelinePayload, MetadataExtractionPayload } from "../../shared/types/payload.types";
import { workerLogger } from "../../loggers";

export class MetadataWorker {
  queue: null | QueueType = null;

  metadataQueue: null | QueueType = null;

  async dequeue() {
    if (!this.queue) {
      this.queue = await getQueue("COMICINFO_EXTRACTION");
    }

    const job: QueueJob | null = this.queue.claimOne("metadata_worker");

    return job;
  }

  async start() {
    console.log("metadata worker has started")

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
    const currentPayload: IngestionToSecondaryPipelinePayload = job.payload as IngestionToSecondaryPipelinePayload

    try {
      const metadata: MetadataCompiled = await readComicFileMetadata(currentPayload.filePath) as MetadataCompiled

      if (!this.metadataQueue) {
        this.metadataQueue = await getQueue("COMICINFO_METADATA_CREATION");
      }

      const nextPayload: MetadataExtractionPayload = {
        ...currentPayload,
        metadata: metadata
      }

      this.metadataQueue.enqueue(nextPayload)
    } catch {
      workerLogger.error("There was an error processing the metadata extraction job for the comic book")
    } finally {
      job.ack();
    }
    
  }
}