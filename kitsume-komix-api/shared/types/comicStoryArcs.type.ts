import { ComicStoryArc } from "./database.types.ts";
import { QueryableColumns } from "../constants/index.ts";

export type AllowedComicStoryArcFilterProperties =
  keyof typeof QueryableColumns["comicReadlists"]["filter"];

export type AllowedComicStoryArcSortProperties =
  keyof typeof QueryableColumns["comicReadlists"]["sort"];

// Comic Story Arc with associated comic book IDs
export type ComicStoryArcWithComicIds = ComicStoryArc & {
  comicBookIds: number[];
};

export type ComicStoryArcFilterItem = {
  filterProperty: AllowedComicStoryArcFilterProperties;
  filterValue: string;
};

export type ComicStoryArcsFilteringAndSortingParams = {
  filters?: ComicStoryArcFilterItem[];
  sort?: {
    property: AllowedComicStoryArcSortProperties;
    order: "asc" | "desc";
  };
  offset?: number;
  limit?: number;
};
