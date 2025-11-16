import type { paths } from '../openapi/openapi-schema';

// /comic-series/{id} endpoint types
export type GetComicSeriesByIdResponse = paths['/comic-series/{id}']['get']['responses']['200']['content']['application/json'];

export type ComicSeriesWithComics = GetComicSeriesByIdResponse['data'];

export type ComicSeriesWithComicsSingleComic = ComicSeriesWithComics["comics"][number];

// /comic-series/latest endpoint types
export type GetLatestComicSeriesResponse = paths['/comic-series/latest']['get']['responses']['200']['content']['application/json'];

export type LatestComicSeriesData = GetLatestComicSeriesResponse['data'];

export type LatestComicSeriesSingle = LatestComicSeriesData[number];

export type LatestComicSeriesMeta = GetLatestComicSeriesResponse['meta'];

// /comic-series/updated endpoint types
export type GetUpdatedComicSeriesResponse = paths['/comic-series/updated']['get']['responses']['200']['content']['application/json'];

export type UpdatedComicSeriesData = GetUpdatedComicSeriesResponse['data'];

export type UpdatedComicSeriesSingle = UpdatedComicSeriesData[number];

export type UpdatedComicSeriesMeta = GetUpdatedComicSeriesResponse['meta'];
