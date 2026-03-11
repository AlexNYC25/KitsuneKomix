import { defineStore } from 'pinia'
import { apiClient } from '../utilities/apiClient'
import type { ComicSeriesResponseItem } from '../types/comic-series.types'
import type { ComicBooksSeriesResponse } from '../types/comic-books.types'

export const useComicSeriesStore = defineStore('comicSeries', {
  state: () => ({
    comicSeriesData: [] as Array<ComicSeriesResponseItem>,
    comicsInSeriesData: new Map<number, ComicBooksSeriesResponse>(),
  }),
	getters: {
		getComicSeriesData(state): Array<ComicSeriesResponseItem> {
			return state.comicSeriesData;
		},
		getComicsInSeries: (state) => (seriesId: number): ComicBooksSeriesResponse | undefined => {
			return state.comicsInSeriesData.get(seriesId);
		}
	},
  actions: {
	async fetchComicSeries(id: number) {
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

	  this.comicSeriesData.push(data.data[0]);
	},
	async lookupComicSeriesById(id: number) {
		const comicSeries = this.comicSeriesData.find((series) => series.id === id);

		if (!comicSeries) {
			await this.fetchComicSeries(id);
			
			return this.comicSeriesData.find(series => series.id === id) || null;

		}

		return comicSeries || null;
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
	}
  }
})
