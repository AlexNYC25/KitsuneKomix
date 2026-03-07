import type { paths } from '../openapi/openapi-schema';

// /comic-series/{id} endpoint types - Get comic books in a series
export type GetComicsBySeries = paths['/comic-series/{id}']['get']['responses']['200']['content']['application/json'];

export type ComicBookInSeriesData = GetComicsBySeries['data'];

export type ComicBook = ComicBookInSeriesData[number];

export type ComicBooksSeriesMeta = GetComicsBySeries['meta'];

export type ComicBooksSeriesResponse = GetComicsBySeries;

// Creator/Person interface for metadata fields
export interface Creator {
	id: number;
	name: string;
}

// /comic-books/{id}/metadata endpoint types - derived from OpenAPI schema
export type ComicBookMetadata = paths['/comic-books/{id}/metadata']['get']['responses']['200']['content']['application/json'];

// /comic-books/{id} endpoint types - base comic book details
export type ComicBookById = paths['/comic-books/{id}']['get']['responses']['200']['content']['application/json'];

// /comic-books/{id}/thumbnails endpoint types
export type GetComicBookThumbnailsResponse = paths['/comic-books/{id}/thumbnails']['get']['responses']['200']['content']['application/json'];

export type ComicBookThumbnailsData = GetComicBookThumbnailsResponse['thumbnails'];

export type ComicBookThumbnail = ComicBookThumbnailsData[number];