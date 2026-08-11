import { 
  getQueue,
  type QueueJob, 
  type QueueType 
} from "kitsune-komix-database"

import {
  workerLogger
} from "../loggers/index"

import {
  addComicBookToSeries
} from "kitsune-komix-database"

import type {
  IngestionToComicSeriesMappingPayload
} from "../shared/types/payload.types"

export class ComicBookSeriesMappingWorker {
  queue: null | QueueType = null;
  nextQueue: null | QueueType = null;

  async dequeue() {
    if (!this.queue) {
      this.queue = await getQueue("BOOK_SERIES_MAPPING");
    }

    const job: QueueJob | null = this.queue.claimOne("book_series_mapping_worker");

    return job;
  }
    
  async start() {
    console.log("comic book to series mapping worker has started")
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
    console.log(job.payload)
    const currentPayload: IngestionToComicSeriesMappingPayload = job.payload as IngestionToComicSeriesMappingPayload

    try {
      const comicBookId: number = currentPayload.comicBookId

    } catch {
      workerLogger.error("There was an error parsing and inserting the initial comic book record")
    } finally {
      job.ack()
    }
  }
}