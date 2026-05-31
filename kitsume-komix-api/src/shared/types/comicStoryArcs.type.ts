import { ComicStoryArc } from "./database.types.ts";
import type {
  ComicReadlistsFilterField,
  ComicReadlistsSortField,
} from "./parameters.type.ts";

export type AllowedComicStoryArcFilterProperties =
  ComicReadlistsFilterField;

export type AllowedComicStoryArcSortProperties =
  ComicReadlistsSortField;

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
