import { defineStore } from 'pinia'
import { apiClient } from '../utilities/apiClient'
import type { ComicSeriesWithComics } from '../types/comic-series.types'
import type { ComicBooksSeriesResponse } from '../types/comic-books.types'

export const useComicSeriesStore = defineStore('comicSeries', {
  state: () => ({
    comicSeriesData: [] as Array<ComicSeriesWithComics>,
    comicsInSeriesData: new Map<number, ComicBooksSeriesResponse>(),
  }),
	getters: {
		getComicSeriesData(state): Array<ComicSeriesWithComics> {
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
			// Construct the URL manually since the OpenAPI schema uses :seriesId format
			const baseUrl = 'http://localhost:8000/api';
			const url = new URL(`${baseUrl}/comic-books/series/${seriesId}`);
			url.searchParams.append('page', String(page));
			url.searchParams.append('pageSize', String(pageSize));

			const response = await fetch(url.toString(), {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json() as ComicBooksSeriesResponse;
			
			// Save to store state
			this.comicsInSeriesData.set(seriesId, data);

			return data;
		} catch (err) {
			throw new Error(err instanceof Error ? err.message : 'Failed to fetch comics in series');
		}
	}
  }
})
