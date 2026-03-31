import { StandardizedComicMetadata } from "#interfaces/index.ts";
import { ComicPage } from "./database.types.ts";

export type ComicBookPagesInfo = {
  comicId: number;
  totalPages: number;
  pagesInDb: number;
  pages: ComicPage[];
};

export type ComicMetadataPage = NonNullable<StandardizedComicMetadata["pages"]>[number];
export type CoverPageRecord = { pageId: number; imagePath: string; pageNumber: number };