import {
  getQueue,
  deleteComicPagesForBook,
  insertComicPage,
  type QueueJob,
  type QueueType
} from "kitsune-komix-database"
import { readComicFileMetadata } from "comic-metadata-tool"
import { workerLogger } from "../../loggers";

import { getArchivesManifest } from "../../utilities/archive";
import { extractEntry } from "../../utilities/7zz.wraper";
import { generateHashForBuffer } from "../../utilities/hash";
import { consolidateComicMetadata } from "../../utilities/metadata/metadataConsolidation";

import type { IngestionToSecondaryPipelinePayload } from "../../shared/types/payload.types";
import type {
  ArchiveEntry,
  ConsolidatedPageInfo,
  PageThumbnailJob,
} from "../../shared/types/utilities.types";
import { buildThumbnailCandidates } from "../../utilities/thumbnailCandidates";

export class ComicPagesWorker {
  queue: null | QueueType = null;

  thumbnailQueue: null | QueueType = null;

  async dequeue() {
    if (!this.queue) {
      this.queue = await getQueue("PROCESS_COMIC_PAGES");
    }

    const job: QueueJob | null = this.queue.claimOne("process_comic_pages_worker");

    return job;
  }
    
  async start() {
    workerLogger.info("process comic pages worker has started")
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
      const manifest = await getArchivesManifest(currentPayload.filePath)

      if (!manifest) {
        throw new Error(`Could not read archive manifest for ${currentPayload.filePath}`)
      }

      await deleteComicPagesForBook(currentPayload.comicBookId)

      let metadataPages: ConsolidatedPageInfo[] = []

      if (manifest.metadataExists) {
        const metadata = await readComicFileMetadata(currentPayload.filePath)
        metadataPages = consolidateComicMetadata(metadata).pages
      }

      const candidateFiles = buildThumbnailCandidates(manifest.files, metadataPages)

      const thumbnailCandidates: PageThumbnailJob["candidates"] = []

      for (let position = 0; position < manifest.files.length; position++) {
        const file = manifest.files[position]

        if (file === undefined) {
          continue
        }

        const fileBytes: ArrayBuffer = await extractEntry(currentPayload.filePath, file.path)

        const fileHash: number | bigint = generateHashForBuffer(fileBytes)

        const pageId = await insertComicPage({
          comicBookId: currentPayload.comicBookId,
          filePath: file.path,
          pageNumber: position + 1,
          type: "Story",
          doublePage: 0,
          hash: String(fileHash),
          fileSize: file.size,
        })

        if (candidateFiles.some((candidate) => candidate.path === file.path)) {
          thumbnailCandidates.push({
            comicPageId: pageId,
            imagePath: file.path,
          })
        }
      }

      if (!this.thumbnailQueue) {
        this.thumbnailQueue = await getQueue("GENERATE_COMIC_THUMBNAILS");
      }

      const thumbnailJob: PageThumbnailJob = {
        comicBookId: currentPayload.comicBookId,
        candidates: thumbnailCandidates,
      }

      this.thumbnailQueue.enqueue(thumbnailJob)

      workerLogger.info(
        `Processed ${manifest.files.length} pages for comic book ${currentPayload.comicBookId}; queued ${thumbnailCandidates.length} thumbnail candidate(s)`
      )

    } catch (error) {
      workerLogger.error(`There was an error processing the comic pages job: ${error}`)
    } finally {
      job.ack()
    }
  }
}