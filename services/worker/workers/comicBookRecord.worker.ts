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
  IngestionToComicBookRecordPayload
} from "../shared/types/payload.types"

import type {
  ComicNameParserResult,
  ArchiveManifest
} from "../shared/types/utilities.types"

export class ComicBookRecordWorker {
  queue: null | QueueType = null;

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

    // TODO: deal with parsed tags?
    const detailsFromFileName: ComicNameParserResult = parseComicNameForDetails(currentPayload.filePath)

    const archiveManifest: ArchiveManifest | undefined = await getArchivesManifest(currentPayload.filePath)

    try {
      const newComicBookRecordData: NewComicBook = {
        filePath: currentPayload.filePath,
        libraryId: currentPayload.libraryId,
        hash: archiveManifest?.hash?.toString() ?? "",
        pageCount: archiveManifest?.files.length,
        year: detailsFromFileName?.year,
        issueNumber: detailsFromFileName?.issue,
        count: detailsFromFileName?.count,
        volumeNumber: detailsFromFileName?.volume?.toString(),
        series: detailsFromFileName?.seriesName,
        format: detailsFromFileName?.format,
        fileSize: archiveManifest?.archiveSize
      }

      const comicBookInsertionResultId: number = await insertComicBook(newComicBookRecordData)

      // Create next payload

    } catch {
      workerLogger.error("There was an error parsing and inserting the initial comic book record")
    } finally {
      job.ack()
    }
    
  }
}