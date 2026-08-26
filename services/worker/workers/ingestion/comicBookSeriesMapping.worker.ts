import { 
  getQueue,
  type ComicSeries,
  type QueueJob, 
  type QueueType 
} from "kitsune-komix-database"

import {
  workerLogger
} from "../../loggers/index"

import {
  addComicBookToSeries,
  findComicSeriesByFolderPath,
  getParentDirectory,
  createComicSeries,
  type NewComicSeries
} from "kitsune-komix-database"

import type {
  IngestionToComicSeriesMappingPayload,
  IngestionToSecondaryPipelinePayload
} from "../../shared/types/payload.types"

export class ComicBookSeriesMappingWorker {
  queue: null | QueueType = null;
  
  metadataQueue: null | QueueType = null;
  pagesQueue: null | QueueType = null;

  async dequeue() {
    if (!this.queue) {
      this.queue = await getQueue("BOOK_SERIES_MAPPING");
    }

    const job: QueueJob | null = this.queue.claimOne("book_series_mapping_worker");

    return job;
  }
    
  async start() {
    workerLogger.info("comic book to series mapping worker has started")
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
    const currentPayload: IngestionToComicSeriesMappingPayload = job.payload as IngestionToComicSeriesMappingPayload

    try {
      const comicSeriesDirectory: string = getParentDirectory(currentPayload.filePath)
      const comicSeries: ComicSeries | null = await findComicSeriesByFolderPath(comicSeriesDirectory)
      let comicSeriesId: number | undefined = comicSeries ? comicSeries.id : undefined

      if (comicSeriesId) {
        await addComicBookToSeries(comicSeriesId, currentPayload.comicBookId)
      } else {
        const newSeriesRecordObject: NewComicSeries = {
          name: currentPayload.filePath.split("/").pop() || "Unknown Series",
          folderPath: comicSeriesDirectory
        }

        comicSeriesId = await createComicSeries(newSeriesRecordObject)
        workerLogger.error("Could not find a matching series for the comic book")
      }

      if (currentPayload.metadataFileExists) {
        const secondaryPayload: IngestionToSecondaryPipelinePayload = {
          filePath: currentPayload.filePath,
          comicBookId: currentPayload.comicBookId,
          metadataFileExists: currentPayload.metadataFileExists,
          seriesId: comicSeriesId,
        }

        if (!this.metadataQueue) {
          this.metadataQueue = await getQueue("COMICINFO_EXTRACTION");
        }

        this.metadataQueue.enqueue(secondaryPayload)
      }

      const pagesPayload: IngestionToSecondaryPipelinePayload = {
        filePath: currentPayload.filePath,
        comicBookId: currentPayload.comicBookId,
        metadataFileExists: currentPayload.metadataFileExists,
        seriesId: comicSeriesId,
      }

      if (!this.pagesQueue) {
        this.pagesQueue = await getQueue("PROCESS_COMIC_PAGES");
      }

      this.pagesQueue.enqueue(pagesPayload)
      

    } catch {
      workerLogger.error("There was an error parsing and inserting the initial comic book record")
    } finally {
      job.ack()
    }
  }
}