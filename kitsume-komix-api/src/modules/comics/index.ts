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
} from "./comicbooks.service.ts";

export {
  fetchAComicsAssociatedMetadataById,
  updateComicBookMetadata,
  updateComicBookMetadataBulk,
} from "./comicMetadata.service.ts";

export {
  startStreamingComicBookFile,
  getComicPagesInfo,
} from "./comicStreaming.service.ts";

export {
  checkComicReadByUser,
  setComicReadByUser,
} from "./comicReading.service.ts";

export {
  getComicThumbnails,
  getComicThumbnailByComicIdThumbnailId,
  deleteComicsThumbnailById,
  createCustomThumbnail,
} from "./comicThumbnails.service.ts";

export {
  getNextComicBookId,
  getPreviousComicBookId,
  getTheReadlistsContainingComicBook,
} from "./comicNavigation.service.ts";

export { attachThumbnailToComicBook } from "./comicbooks.service.ts";