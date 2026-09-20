import {
  getQueue,
  deleteComicPagesForBook,
  insertComicPage,
  type QueueJob,
  type QueueType
} from "kitsune-komix-database"
import { workerLogger } from "../../loggers";

import { getArchivesManifest } from "../../utilities/archive";
import { extractEntry } from "../../utilities/7zz.wraper";
import { generateHashForBuffer } from "../../utilities/hash";

import type { IngestionToSecondaryPipelinePayload } from "../../shared/types/payload.types";
import type {
  ArchiveEntry,
  PageThumbnailJob,
} from "../../shared/types/utilities.types";

/**
 * Selects which images in the archive need a thumbnail generated.
 *
 * Currently returns only the first image alphabetically. When a metadata
 * object exists in the archive, this can later be expanded to also include
 * files whose stored path is labeled as a thumbnail.
 * @param files The archive's images in alphabetical order
 * @param metadataExists Whether the archive contains a metadata file
 * @returns The candidate image files
 */
const buildThumbnailCandidates = (
  files: ArchiveEntry[],
  metadataExists: boolean,
): ArchiveEntry[] => {
  const firstFile = files[0]

  if (!firstFile) {
    return []
  }

  return [firstFile]
}

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

      const candidateFiles = buildThumbnailCandidates(manifest.files, manifest.metadataExists)

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