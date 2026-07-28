import { 
  getQueue,
  getLibraryContainingPath,
  type QueueJob, 
  type QueueType, 
  type ComicLibrary
} from "kitsune-komix-database"

import {
  workerLogger
} from "../loggers/index"

import type {
  IngestionPayload,
  IngestionToComicBookRecordPayload
} from "../shared/types/payload.types"

export class IngestionWorker {
  queue: null | QueueType = null;
  nextQueue: null | QueueType = null;

  async dequeue() {
    if (!this.queue) {
      this.queue = await getQueue("INGESTION_DISCOVERY");
    }

    const job: QueueJob | null = this.queue.claimOne("ingestion_worker");

    return job;
  }
    
  async start() {
    console.log("ingestion worker has started")
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
    const currentPayload: IngestionPayload = job.payload as IngestionPayload

    const file = Bun.file(currentPayload.filePath)

    if (await file.exists()) {

      const libraryBookBelongsTo: ComicLibrary | null = await getLibraryContainingPath(currentPayload.filePath)

      if (!libraryBookBelongsTo) {
        workerLogger.error("The file being processed does not belong to a library registered")
        job.fail("No Library found for the file's path location")
        return;
      }
      
      if(!this.nextQueue) {
        this.nextQueue = await getQueue("BOOK_RECORD");
      }

      const nextJobPayload: IngestionToComicBookRecordPayload = {
        ...currentPayload,
        libraryId: libraryBookBelongsTo.id
      }

      this.nextQueue.enqueue(nextJobPayload)
    } else {
      // log error that the file no longer exists before we could start processing it
      workerLogger.error("File no longer exists, did not start processing file.")
    }


    job.ack()
  }
}