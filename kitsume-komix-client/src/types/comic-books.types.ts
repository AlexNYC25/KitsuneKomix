import type { paths } from '../openapi/openapi-schema';

// /comic-books/series/:seriesId endpoint types
export type GetComicsBySeries = paths['/comic-books/series/:seriesId']['get']['responses']['200']['content']['application/json'];

export type ComicBookInSeriesData = GetComicsBySeries['data'];

export type ComicBook = ComicBookInSeriesData[number];

export type ComicBooksSeriesMeta = GetComicsBySeries['meta'];

export type ComicBooksSeriesResponse = GetComicsBySeries;
