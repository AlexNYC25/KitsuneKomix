import { ComicBookStoryArc, ComicStoryArc } from "./database.types.ts";

// Comic Story Arc with associated comic book IDs
export type ComicStoryArcWithComicIds = ComicStoryArc & {
  comicBookIds: number[];
};