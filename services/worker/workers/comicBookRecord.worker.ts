import { 
  getQueue,
  insertComicBook,
  type QueueJob, 
  type QueueType,
  type NewComicBook
} from "kitsune-komix-database"

import {
  workerLogger
} from "../loggers/index"

import {
  parseComicNameForDetails
} from "../utilities/comicNameParser"

import {
  getArchivesManifest
} from "../utilities/archive"

import type {
  IngestionToComicBookRecordPayload,
  IngestionToComicSeriesMappingPayload
} from "../shared/types/payload.types"

import type {
  ComicNameParserResult,
  ArchiveManifest
} from "../shared/types/utilities.types"

export class ComicBookRecordWorker {
  queue: null | QueueType = null;
  nextQueue: null | QueueType = null;

  async dequeue() {
    if (!this.queue) {
      this.queue = await getQueue("BOOK_RECORD");
    }

    const job: QueueJob | null = this.queue.claimOne("comic_book_record_worker");

    return job;
  }
    
  async start() {
    console.log("comic book record worker has started")
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
    // create basic initial record for the comic book table
    const currentPayload: IngestionToComicBookRecordPayload = job.payload as IngestionToComicBookRecordPayload

    // NOTE: Tags values are not currently used
    const detailsFromFileName: ComicNameParserResult = parseComicNameForDetails(currentPayload.filePath)

    const archiveManifest: ArchiveManifest | undefined = await getArchivesManifest(currentPayload.filePath)

    try {
      const newComicBookRecordData: NewComicBook = {
        filePath: currentPayload.filePath,
        libraryId: currentPayload.libraryId,
        hash: archiveManifest?.hash?.toString() ?? "",
        year: detailsFromFileName?.year,
        series: detailsFromFileName?.seriesName,
        issueNumber: detailsFromFileName?.issue,
        count: detailsFromFileName?.count,
        volumeNumber: detailsFromFileName?.volume?.toString(),
        pageCount: archiveManifest?.files.length,
        fileSize: archiveManifest?.archiveSize,
        format: detailsFromFileName?.format,
      }

      const comicBookInsertionResultId: number = await insertComicBook(newComicBookRecordData)      

      if(!this.nextQueue) {
        this.nextQueue = await getQueue("BOOK_SERIES_MAPPING");
      }

      // Create next payload
      // TODO: Update to include boolean flag for if the comic book file has a metadata file as part of it
      const nextJobPayload: IngestionToComicSeriesMappingPayload = {
        ...currentPayload,
        comicBookId: comicBookInsertionResultId
      }

      this.nextQueue.enqueue(nextJobPayload)

    } catch {
      workerLogger.error("There was an error parsing and inserting the initial comic book record")
    } finally {
      job.ack()
    }
    
  }
}