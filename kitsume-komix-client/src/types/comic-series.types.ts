import type { paths } from '../openapi/openapi-schema';

export type GetComicSeriesByIdResponse = paths['/comic-series/{id}']['get']['responses']['200']['content']['application/json'];

export type ComicSeriesWithComics = GetComicSeriesByIdResponse['data'];

export type ComicSeriesWithComicsSingleComic = ComicSeriesWithComics["comics"][number];