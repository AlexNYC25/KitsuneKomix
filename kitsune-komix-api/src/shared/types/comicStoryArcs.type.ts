import type { z } from "zod";
import type { ReadListSchema } from "#zod/schemas/data/comicReadlists.schema.ts";

import type { ComicStoryArc } from "./database.types.ts";
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

export type ComicStoryArcWithComicBooks = z.infer<typeof ReadListSchema>;
