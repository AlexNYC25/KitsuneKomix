import { ComicPage } from "./database.types.ts";

export type ComicBookPagesInfo = {
  comicId: number;
  totalPages: number;
  pagesInDb: number;
  pages: ComicPage[];
};