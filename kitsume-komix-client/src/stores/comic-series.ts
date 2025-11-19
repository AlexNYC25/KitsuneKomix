import { defineStore } from 'pinia'
import { apiClient } from '../utilities/apiClient'
import type { ComicSeriesWithComics } from '../types/comic-series.types'
import type { ComicBooksSeriesResponse } from '../types/comic-books.types'

export const useComicSeriesStore = defineStore('comicSeries', {
  state: () => ({
    comicSeriesData: [] as Array<ComicSeriesWithComics>,
  }),
	getters: {
		getComicSeriesData(state): Array<ComicSeriesWithComics> {
			return state.comicSeriesData;
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

	  this.comicSeriesData.push(data.data);
	},
	async lookupComicSeriesById(id: number) {
		if (!this.comicSeriesData) {
			return null;
		}

		const comicSeries = this.comicSeriesData.find(series => series.id === id);

		if (!comicSeries) {
			await this.fetchComicSeries(id);
			
			return this.comicSeriesData.find(series => series.id === id) || null;

		}

		return comicSeries || null;
	},
	async fetchComicsInSeries(seriesId: number, page: number = 1, pageSize: number = 20): Promise<ComicBooksSeriesResponse> {
		try {
			const { data, error } = await apiClient.GET('/comic-books/series/:seriesId', {
				params: {
					path: {
						seriesId: String(seriesId)
					},
					query: {
						page,
						pageSize
					}
				}
			});

			if (error || !data) {
				throw new Error('Failed to fetch comics in series');
			}

			return data;
		} catch (err) {
			throw new Error(err instanceof Error ? err.message : 'Failed to fetch comics in series');
		}
	}
  }
})
