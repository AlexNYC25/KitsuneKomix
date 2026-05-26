import { defineStore } from "pinia";

import { CACHE_TTL_MS } from "@/config/cache";
import { mapForCategoryToDbField } from "@/config/sort";
import type {
	ComicBook,
	ComicBooksResponseMeta,
	ComicBooksFilterValuesData,
	GetComicsResponse
} from "@/types/comic-books.types";
import { apiClient, serializeFilterParmas } from "@/utilities/apiClient";
import { createCacheKeyForComics } from "@/utilities/cache";

export const useComicBooksStore = defineStore("comicBooks", {
	state: () => ({
		comicBooksCache: new Map<number, ComicBook>(),
		comicBooksListCache: new Map<string, { data: ComicBook[]; meta: ComicBooksResponseMeta }>(),
		comicBooksFilterValuesCache: new Map<number, ComicBooksFilterValuesData>(),
	}),
	getters: {
		getComicById: (state) => (id: number): ComicBook | undefined => {
			return state.comicBooksCache.get(id);
		},
		getLatestComicBooksFilterValues: (state): { timestamp: number; data: ComicBooksFilterValuesData } | undefined => {
			let latestCachedEntry: { timestamp: number; data: ComicBooksFilterValuesData } | undefined;

			for (const [timestamp, data] of state.comicBooksFilterValuesCache.entries()) {
				if (!latestCachedEntry || timestamp > latestCachedEntry.timestamp) {
					latestCachedEntry = { timestamp, data };
				}
			}

			return latestCachedEntry;
		}
	},
	actions: {
		async fetchComicBookFilterValues(): Promise<ComicBooksFilterValuesData> {
			const latestCachedEntry = this.getLatestComicBooksFilterValues;

			if (latestCachedEntry && (Date.now() - latestCachedEntry.timestamp < 10 * 60 * 1000)) {
				return latestCachedEntry.data;
			}

			try {
				const { data, error } = await apiClient.GET('/comic-books/filter-values');

				if (error || !data) {
					throw new Error(error?.message || 'Failed to fetch comic books filter values');
				}

				this.comicBooksFilterValuesCache.set(Date.now(), data.data);
				return data.data;
			} catch (error) {
				throw new Error(error instanceof Error ? error.message : 'An unknown error occurred while fetching comic books filter values');
			}
		},
		async fetchComicBook(id: number): Promise<ComicBook> {
			const cached = this.comicBooksCache.get(id);
			if (cached) {
				return cached;
			}

			const { data, error } = await apiClient.GET('/comic-books/{id}', {
				params: {
					path: {
						id: String(id)
					}
				}
			});

			if (error || !data) {
				throw new Error(error?.message || 'Failed to fetch comic book');
			}

			if (!data) {
				throw new Error('Comic book not found');
			}

			this.comicBooksCache.set(id, data);
			return data;
		},
		fetchComicListFromCache(
			page: number = 1,
			pageSize: number = 20,
			resolvedSort: string = 'createdAt',
		): GetComicsResponse | null {
			const cacheKey: string = createCacheKeyForComics(page, pageSize, resolvedSort);

			const cached: GetComicsResponse | undefined = this.comicBooksListCache.get(cacheKey);
			if (cached && (Date.now() - Number(cached.meta.timestamp) < CACHE_TTL_MS)) {
				return { data: cached.data, meta: cached.meta };
			} else if (cached) {
				this.comicBooksListCache.delete(cacheKey);
			}

			return null;
		},
		async fetchComicBookList(
			page: number = 1,
			pageSize: number = 20,
			sort: string = 'latest',
			filterProperties: string [] = [],
			filterValues: string [] = []
		): Promise<{ data: ComicBook[]; meta: ComicBooksResponseMeta }> {
			const resolvedSortForRequest: string = mapForCategoryToDbField[sort] || sort;
			const hasFilters: boolean = filterProperties.length > 0;

			if (!hasFilters) {
				const cachedDataSet: GetComicsResponse | null = this.fetchComicListFromCache(page, pageSize, resolvedSortForRequest);

				if (cachedDataSet) {
					return cachedDataSet;
				}
			}

			try {
				const { data, error } = await apiClient.GET('/comic-books', {
					params: {
						query: { page, pageSize, sort: resolvedSortForRequest },
					},
					querySerializer: (baseQuery) =>	serializeFilterParmas(baseQuery, filterProperties, filterValues)
				});

				if (error || !data) {
					throw new Error(error?.message || 'Failed to fetch comic book list');
				}

				const comicListData: GetComicsResponse = data || [];

				if (!hasFilters) {
					const cacheKey = createCacheKeyForComics(page, pageSize, resolvedSortForRequest);
					this.comicBooksListCache.set(cacheKey, comicListData );
				}

				return { data: comicListData.data, meta: comicListData.meta };
			} catch (error) {
				throw new Error(error instanceof Error ? error.message : 'An unknown error occurred while fetching comic book list');
			}
		}
	}
});