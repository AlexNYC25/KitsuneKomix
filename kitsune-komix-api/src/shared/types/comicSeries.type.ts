import type { z } from "zod";

import type { ComicSeriesSchema, ComicSeriesMetaData } from "#zod/schemas/data/comicSeries.schema.ts";
import type { MetadataExpandedSchema } from "#zod/schemas/data/comicMetadata.schema.ts";

import type { ComicSeriesFilterField, ComicSeriesSortField } from "#types/parameters.type.ts";

export type AllowedComicSeriesSortFilterProperties = ComicSeriesFilterField;

export type AllowedComicSeriesSortProperties = ComicSeriesSortField;

export type ComicSeriesFilterItem = {
  filterProperty: AllowedComicSeriesSortFilterProperties;
  filterValue: string;
};

export type ComicSeriesFilteringAndSortingParams = {
  filters?: ComicSeriesFilterItem[];
  sort?: {
    property: ComicSeriesSortField;
    order: "asc" | "desc";
  };
  offset?: number;
  limit?: number;
};

export type ComicSeriesMetadata = z.infer<typeof ComicSeriesMetaData>;

export type ComicSeriesCreditMetadata = z.infer<typeof MetadataExpandedSchema>;

export type ComicSeriesWithMetadata = z.infer<typeof ComicSeriesSchema>;

export type ComicSeriesLevelMetadataOnly = {
  years?: number[];
  letters?: string[];
};

export type ComicSeriesFilterValues = ComicSeriesCreditMetadata & ComicSeriesLevelMetadataOnly;