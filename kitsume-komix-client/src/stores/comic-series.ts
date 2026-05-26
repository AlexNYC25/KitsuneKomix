import { defineStore } from 'pinia'

import { CACHE_TTL_MS } from "@/config/cache";
import { mapForCategoryToDbField } from "@/config/sort";
import type { GetComicsResponse } from '@/types/comic-books.types'
import type { 
	GetComicSeriesResponse, 
	ComicSeriesResponseItem, 
	ComicSeriesFilterValuesData,
} from '@/types/comic-series.types'
import { apiClient, serializeFilterParmas } from '@/utilities/apiClient'
import { createCacheKeyForComics } from "@/utilities/cache";

export const useComicSeriesStore = defineStore('comicSeries', {
  state: () => ({
    comicSeriesCache: new Map<string, GetComicSeriesResponse>(),
    comicsInSeriesData: new Map<number, GetComicsResponse>(),
    comicSeriesById: new Map<number, ComicSeriesResponseItem>(),
    comicSeriesFilterValuesCache: new Map<number, ComicSeriesFilterValuesData>(),
  }),
	getters: {
		getComicSeriesByParams: (state) => (page: number, pageSize: number, sort: string) => {
			const cacheKey: string = createCacheKeyForComics(page, pageSize, sort);
			return state.comicSeriesCache.get(cacheKey)?.data;
		},
		getComicsInSeries: (state) => (seriesId: number): GetComicsResponse | undefined => {
			return state.comicsInSeriesData.get(seriesId);
		},
		getLatestComicSeriesFilterValues: (state): { timestamp: number; data: ComicSeriesFilterValuesData } | undefined => {
			let latestCachedEntry: { timestamp: number; data: ComicSeriesFilterValuesData } | undefined;

			for (const [timestamp, data] of state.comicSeriesFilterValuesCache.entries()) {
				if (!latestCachedEntry || timestamp > latestCachedEntry.timestamp) {
					latestCachedEntry = { timestamp, data };
				}
			}

			return latestCachedEntry;
		}
	},
  actions: {
		async fetchComicSeries(id: number) {
			const cached: ComicSeriesResponseItem | undefined = this.comicSeriesById.get(id);
			if (cached) {
				return cached;
			}

			const { data, error } = await apiClient.GET('/comic-series/{id}', {
				params: {
					path: {
						id: String(id)
					}
				}
			});

			if (error || !data) {
				throw new Error(error?.message || 'Failed to fetch comic series');
			}

			if (!data.data?.length) {
				throw new Error('Comic series not found');
			}

			const series: ComicSeriesResponseItem | undefined = data.data[0];
			this.comicSeriesById.set(id, series);
			return series;
		},
		async lookupComicSeriesById(id: number) {
			try {
				return await this.fetchComicSeries(id);
			} catch {
				return null;
			}
		},
		async fetchComicsInSeries(seriesId: number, page: number = 1, pageSize: number = 20): Promise<GetComicsResponse> {
			try {
				const { data, error } = await apiClient.GET('/comic-books', {
					params: {
						query: {
							page,
							pageSize,
							filterProperty: 'seriesId',
							filter: String(seriesId),
							sort: "createdAt"
						}
					}
				});

				if (error || !data) {
					throw new Error(error?.message || 'Failed to fetch comics in series');
				}
				
				// Save to store state
				this.comicsInSeriesData.set(seriesId, data);

				return data;
			} catch (err) {
				throw new Error(err instanceof Error ? err.message : 'Failed to fetch comics in series');
			}
		},
		fetchComicSeriesListFromCache(
			page: number = 1,
			pageSize: number = 20,
			sort: string = "createdAt"
		): GetComicSeriesResponse | null {
			const cacheKey: string = createCacheKeyForComics(page, pageSize, sort);
			const cachedEntry: GetComicSeriesResponse | undefined = this.comicSeriesCache.get(cacheKey);

			if (cachedEntry && (Date.now() - Number(cachedEntry.meta.timestamp) < CACHE_TTL_MS)) {
				return cachedEntry;
			} else if (cachedEntry) {
				this.comicSeriesCache.delete(cacheKey);
			}

			return null;
		},
		async fetchComicSeriesList(
			page: number = 1,
			pageSize: number = 20,
			sort: string = "latest",
			filterProperties: string[] = [],
			filterValues: string[] = [],
		): Promise<{ data: ComicSeriesResponseItem[]; meta: { count: number; hasNextPage: boolean; currentPage: number; pageSize: number } }> {
			const resolvedSortForRequest: string = mapForCategoryToDbField[sort] || sort;
			const hasFilters: boolean = filterProperties.length > 0;

			if (!hasFilters) {
				const cachedDataSet: GetComicSeriesResponse | null = this.fetchComicSeriesListFromCache(page, pageSize, resolvedSortForRequest);

				if (cachedDataSet) {
					return cachedDataSet;
				}
			}

			try {
				const { data, error } = await apiClient.GET('/comic-series', {
					params: {
						query: { page, pageSize, sort: resolvedSortForRequest },
					},
					querySerializer: (baseQuery) => serializeFilterParmas(baseQuery, filterProperties, filterValues),
				});

				if (error || !data) {
					throw new Error(error?.message || 'Failed to fetch comic series list');
				}

				const seriesData: GetComicSeriesResponse = data || [];

				if (!hasFilters) {
					const cacheKey: string = createCacheKeyForComics(page, pageSize, resolvedSortForRequest);
					this.comicSeriesCache.set(cacheKey, seriesData);
				}

				return { data: seriesData.data, meta: seriesData.meta };
			} catch (err) {
				throw new Error(err instanceof Error ? err.message : 'Failed to fetch comic series list');
			}
		},
		async fetchComicSeriesFilterValues(): Promise<ComicSeriesFilterValuesData> {
			const latestCachedEntry: { timestamp: number; data: ComicSeriesFilterValuesData } | undefined = this.getLatestComicSeriesFilterValues;

			// Reuse the cached filter values when the newest entry is still within the staleness window.
			if (latestCachedEntry && Date.now() - latestCachedEntry.timestamp < CACHE_TTL_MS) {
				return latestCachedEntry.data;
			}

			try {
				const { data, error } = await apiClient.GET('/comic-series/filter-values');

				if (error || !data?.data) {
					throw new Error(error?.message || 'Failed to fetch comic series filter values');
				}

				const fetchedAt: number = Date.now();
				this.comicSeriesFilterValuesCache.set(fetchedAt, data.data);

				return data.data;
			} catch (err) {
				throw new Error(err instanceof Error ? err.message : 'Failed to fetch comic series filter values');
			}
		}
  }
})
