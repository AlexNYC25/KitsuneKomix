import { mkdir } from "node:fs/promises"

import {
  deleteComicBookCoversForBook,
  deleteComicBookThumbnailsForBook,
  getComicBookById,
  getQueue,
  insertComicBookCover,
  insertComicBookThumbnail,
  type QueueJob,
  type QueueType,
} from "kitsune-komix-database"

import { workerLogger } from "../../loggers"
import { extractEntry } from "../../utilities/7zz.wraper"
import {
  createThumbnail,
  getThumbnailDirectoryPath,
  getThumbnailFilePath,
} from "../../utilities/thumbnails"

import type { PageThumbnailJob } from "../../shared/types/utilities.types"

export class ComicThumbnailsWorker {
  queue: null | QueueType = null

  async dequeue() {
    if (!this.queue) {
      this.queue = await getQueue("GENERATE_COMIC_THUMBNAILS")
    }

    const job: QueueJob | null = this.queue.claimOne("generate_comic_thumbnails_worker")

    return job
  }

  async start() {
    workerLogger.info("comic thumbnails worker has started")

    while (true) {
      const job: QueueJob | null = await this.dequeue()

      if (!job) {
        await new Promise(resolve => setTimeout(resolve, 1000))

        continue
      }

      await this.processJob(job)
    }
  }

  async processJob(job: QueueJob) {
    const currentPayload = job.payload as PageThumbnailJob

    try {
      const comicBook = await getComicBookById(currentPayload.comicBookId)

      if (!comicBook) {
        throw new Error(`Could not find comic book ${currentPayload.comicBookId}`)
      }

      await deleteComicBookThumbnailsForBook(currentPayload.comicBookId)
      await deleteComicBookCoversForBook(currentPayload.comicBookId)

      const thumbnailDirectory = getThumbnailDirectoryPath(currentPayload.comicBookId)
      await mkdir(thumbnailDirectory, { recursive: true })

      let generatedThumbnailCount = 0

      for (const candidate of currentPayload.candidates) {
        const sourceBytes = await extractEntry(comicBook.filePath, candidate.imagePath)
        const thumbnailBytes = await createThumbnail(sourceBytes)
        const thumbnailPath = getThumbnailFilePath(
          currentPayload.comicBookId,
          candidate.imagePath,
        )

        await Bun.write(thumbnailPath, thumbnailBytes)

        const comicBookCoverId = await insertComicBookCover({
          comicPageId: candidate.comicPageId,
          filePath: thumbnailPath,
        })

        await insertComicBookThumbnail({
          comicBookId: currentPayload.comicBookId,
          comicBookCoverId,
          filePath: thumbnailPath,
          thumbnailType: "generated",
        })

        generatedThumbnailCount += 1
      }

      workerLogger.info(
        `Generated ${generatedThumbnailCount} thumbnail(s) for comic book ${currentPayload.comicBookId}`,
      )
    } catch (error) {
      workerLogger.error(`There was an error generating comic book thumbnails: ${error}`)
    } finally {
      job.ack()
    }
  }
}
