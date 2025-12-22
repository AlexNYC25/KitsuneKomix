import type {
	ComicSeries,
	ComicSeriesWithMetadata,
} from "#types/database.types.ts";

import type {
	ComicBookWithThumbnail,
} from "#types/comicBook.type.ts";

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