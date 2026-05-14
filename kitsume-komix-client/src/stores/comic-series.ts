import { defineStore } from 'pinia'

import type { ComicBooksSeriesResponse } from '@/types/comic-books.types'
import type { ComicSeriesResponseItem } from '@/types/comic-series.types'
import { apiClient } from '@/utilities/apiClient'

const createCacheKey = (page: number, pageSize: number, sort: string) => `${page}:${pageSize}:${sort}`;

export const useComicSeriesStore = defineStore('comicSeries', {
  state: () => ({
    comicSeriesCache: new Map<string, { data: ComicSeriesResponseItem[]; timestamp: number }>(),
    comicsInSeriesData: new Map<number, ComicBooksSeriesResponse>(),
    comicSeriesById: new Map<number, ComicSeriesResponseItem>(),
  }),
	getters: {
		getComicsInSeries: (state) => (seriesId: number): ComicBooksSeriesResponse | undefined => {
			return state.comicsInSeriesData.get(seriesId);
		},
		getComicSeriesByParams: (state) => (page: number, pageSize: number, sort: string) => {
			const cacheKey = createCacheKey(page, pageSize, sort);
			return state.comicSeriesCache.get(cacheKey)?.data;
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
		}
  }
})
