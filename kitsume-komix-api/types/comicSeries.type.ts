import { QueryableColumns } from "../constants/index.ts";
import type {
	ComicSeries,
	ComicSeriesWithMetadata,
	ComicBookWithThumbnail,
	ComicSeriesSortField,
} from "#types/index.ts";

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