import { defineStore } from 'pinia'
import { apiClient } from '../utilities/apiClient'
import type { ComicSeriesWithComics } from '../types/comic-series.types'

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
	}
  }
})
