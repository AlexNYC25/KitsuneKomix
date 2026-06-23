/**
 * Comics Module - Barrel Export
 *
 * Central export point for all comic-related services.
 * Import from this file to access all comic book functionality.
 *
 * @example
 * import {
 *   fetchComicBooksWithRelatedMetadata,
 *   updateComicBookMetadata,
 *   startStreamingComicBookFile,
 * } from '#modules/comics/index.ts';
 */

export {
  fetchComicBooksWithRelatedMetadata,
  fetchComicDuplicatesInTheDb,
  fetchRandomComicBook,
  getComicBookById,
  processComicBookDeletion,
} from "./comic-books.service.ts";

export {
  fetchAComicsAssociatedMetadataById,
  compileEntireComicBooksMetadataAndAdditionalComicBookInfo,
  updateComicBookMetadata,
  updateComicBookMetadataBulk,
  assembleComicBookMetadataBatch,
} from "./comic-metadata.service.ts";

export {
  startStreamingComicBookFile,
  getComicPagesInfo,
} from "./comic-streaming.service.ts";

export {
  checkComicReadByUser,
  setComicReadByUser,
  assembleComicBookReadStatusBatch,
} from "./comic-reading.service.ts";

export {
  getComicThumbnails,
  getComicThumbnailByComicIdThumbnailId,
  deleteComicsThumbnailById,
  createCustomThumbnail,
  assembleComicBookThumbnailsBatch,
} from "./comic-thumbnails.service.ts";

export {
  getNextComicBookId,
  getPreviousComicBookId,
  getTheReadlistsContainingComicBook,
} from "./comic-navigation.service.ts";

export { attachThumbnailToComicBook } from "./comic-books.service.ts";

export { packDataIntoComicBookMultipleResponse } from "./comic-response-helpers.service.ts";