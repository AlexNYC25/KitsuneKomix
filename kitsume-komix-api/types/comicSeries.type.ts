import { QueryableColumns } from "../constants/index.ts";

import type {
	ComicSeries
} from "#types/database.types.ts";

import type {
	ComicSeriesSortField,
} from "#types/parameters.type.ts";

import type {
	ComicBookWithThumbnail
} from "#types/comicBook.type.ts";

export type ComicSeriesWithMetadata = ComicSeries & {
  writers?: string;
  pencillers?: string;
  inkers?: string;
  letterers?: string;
  editors?: string;
  cover_artists?: string;
  publishers?: string;
  imprints?: string;
  genres?: string;
  characters?: string;
  teams?: string;
  locations?: string;
  story_arcs?: string;
  series_groups?: string;
};

// Extended type including optional thumbnail URL
export type ComicSeriesWithThumbnail = ComicSeries & { thumbnailUrl?: string };

// Extended type including thumbnail URL and metadata object who may be empty or be a full metadata record
export type ComicSeriesWithMetadataAndThumbnail = ComicSeriesWithThumbnail & {
	metadata: ComicSeriesWithMetadata | Record<PropertyKey, never>;
};

export type ComicSeriesWithComicsMetadataAndThumbnail =
	& ComicSeriesWithMetadataAndThumbnail
	& {
		comics: Array<ComicBookWithThumbnail>;
	};

export type AllowedComicSeriesSortFilterProperties = keyof typeof QueryableColumns["comicSeries"]["filter"];

export type AllowedComicSeriesSortProperties = keyof typeof QueryableColumns["comicSeries"]["sort"];

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