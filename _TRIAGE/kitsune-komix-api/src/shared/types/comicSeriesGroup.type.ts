import type { z } from "zod";

import type { ComicCollectionSchema } from "#zod/schemas/data/comicCollections.schema.ts";

import type {
  ComicSeriesGroupsSortField,
  ComicSeriesGroupsFilterField
} from "./parameters.type.ts";

export type AllowedComicSeriesGroupFilterProperties =
  ComicSeriesGroupsFilterField;

export type AllowedComicSeriesGroupSortProperties =
  ComicSeriesGroupsSortField;

export type ComicSeriesGroupsFilterItem = {
  filterProperty: ComicSeriesGroupsFilterField;
  filterValue: string;
};

export type ComicSeriesGroupsFilteringAndSortingParams = {
  filters?: ComicSeriesGroupsFilterItem[];
  sort?: {
    property: AllowedComicSeriesGroupSortProperties;
    order: "asc" | "desc";
  };
  offset?: number;
  limit?: number;
};

export type ComicSeriesGroupWithComicBooks = z.infer<typeof ComicCollectionSchema>;