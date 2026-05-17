import { defineStore } from 'pinia'

import type { ComicBooksSeriesResponse } from '@/types/comic-books.types'
import type { ComicSeriesResponseItem, ComicSeriesFilterValuesData } from '@/types/comic-series.types'
import { apiClient } from '@/utilities/apiClient'
import { DEFAULT_HEADER_AUTHORIZATION } from '@/utilities/constants'

const createCacheKey = (page: number, pageSize: number, sort: string) => `${page}:${pageSize}:${sort}`;
const FILTER_VALUES_CACHE_TTL_MS = 10 * 60 * 1000;

export const useComicSeriesStore = defineStore('comicSeries', {
  state: () => ({
    comicSeriesCache: new Map<string, { data: ComicSeriesResponseItem[]; timestamp: number }>(),
    comicsInSeriesData: new Map<number, ComicBooksSeriesResponse>(),
    comicSeriesById: new Map<number, ComicSeriesResponseItem>(),
    comicSeriesFilterValuesCache: new Map<number, ComicSeriesFilterValuesData>(),
  }),
	getters: {
		getComicsInSeries: (state) => (seriesId: number): ComicBooksSeriesResponse | undefined => {
			return state.comicsInSeriesData.get(seriesId);
		},
		getComicSeriesByParams: (state) => (page: number, pageSize: number, sort: string) => {
			const cacheKey = createCacheKey(page, pageSize, sort);
			return state.comicSeriesCache.get(cacheKey)?.data;
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
			const cached = this.comicSeriesById.get(id);
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

			const series = data.data[0];
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
		async fetchComicsInSeries(seriesId: number, page: number = 1, pageSize: number = 20): Promise<ComicBooksSeriesResponse> {
			try {
				const { data, error } = await apiClient.GET('/comic-books/all', {
					params: {
						query: {
							page,
							pageSize,
							filterProperty: 'seriesId',
							filter: String(seriesId)
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
		async fetchComicSeriesList(page: number = 1, pageSize: number = 20, sort: string = "latest"): Promise<ComicSeriesResponseItem[]> {
			const mapForCategoryToDbField: Record<string, string> = {
				latest: 'createdAt',
				updated: 'updatedAt',
				name: 'name'
			};

			const cacheKey = createCacheKey(page, pageSize, mapForCategoryToDbField[sort] || 'createdAt');
			const cached = this.comicSeriesCache.get(cacheKey);
			
			// Return cached data if available and less than 5 minutes old
			if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
				return cached.data;
			}

			try {
				const { data, error } = await apiClient.GET('/comic-series', {
					params: {
						query: {
							page,
							pageSize,
							sort
						}
					}
				});

				if (error || !data) {
					throw new Error(error?.message || 'Failed to fetch comic series list');
				}

				const seriesData = data.data || [];
				
				// Store in cache with timestamp
				this.comicSeriesCache.set(cacheKey, {
					data: seriesData,
					timestamp: Date.now()
				});

				return seriesData;
			} catch (err) {
				throw new Error(err instanceof Error ? err.message : 'Failed to fetch comic series list');
			}
		},
		async fetchComicSeriesFilterValues(): Promise<ComicSeriesFilterValuesData> {
			const latestCachedEntry = this.getLatestComicSeriesFilterValues;

			// Reuse the cached filter values when the newest entry is still within the staleness window.
			if (latestCachedEntry && Date.now() - latestCachedEntry.timestamp < FILTER_VALUES_CACHE_TTL_MS) {
				return latestCachedEntry.data;
			}

			try {
				const { data, error } = await apiClient.GET('/comic-series/filter-values', {
					params: {
						header: DEFAULT_HEADER_AUTHORIZATION
					}
				});

				if (error || !data?.data) {
					throw new Error(error?.message || 'Failed to fetch comic series filter values');
				}

				const fetchedAt = Date.now();
				this.comicSeriesFilterValuesCache.set(fetchedAt, data.data);

				return data.data;
			} catch (err) {
				throw new Error(err instanceof Error ? err.message : 'Failed to fetch comic series filter values');
			}
		}
  }
})
