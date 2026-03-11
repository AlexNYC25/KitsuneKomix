import type { paths } from '../openapi/openapi-schema';

// /comic-series/{id} endpoint types
export type GetComicSeriesByIdResponse = paths['/comic-series/{id}']['get']['responses']['200']['content']['application/json'];

export type ComicSeriesWithComics = GetComicSeriesByIdResponse['data'];

export type ComicSeriesResponseItem = ComicSeriesWithComics[number];

export type ComicSeriesComic = NonNullable<ComicSeriesResponseItem['comicBooks']>[number];

export type ComicSeriesWithComicsSingleComic = ComicSeriesComic;

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

// Minimal shape required to render a comic series in the carousel.
// Derived from LatestComicSeriesSingle which shares the same structure as UpdatedComicSeriesSingle.
export type ComicSeriesCarouselItem = Pick<LatestComicSeriesSingle, 'id' | 'name' | 'thumbnailUrl'>;
