import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

type comicSeriesDataWithMetadataAndThumbnail = {
	id: number;
	name: string;
	description: string | null;
	folderPath: string;
	createdAt: string;
	updatedAt: string;
	thumbnailUrl: string | null;
	metadata: {
		id: number;
		name: string;
		description: string | null;
		folderPath: string;
		createdAt: string;
		updatedAt: string;
		writers?: string,
		pencillers?: string,
		inkers?: string,
		letterers?: string,
		editors?: string,
		cover_artists?: string,
		publishers?: string,
		imprints?: string,
		genres?: string,
		characters?: string,
		teams?: string,
		locations?: string,
		story_arcs?: string,
		series_groups?: string,
	};
};

export const useComicSeriesStore = defineStore('comicSeries', {
  state: () => ({
    comicSeriesData: [] as Array<comicSeriesDataWithMetadataAndThumbnail>,
  }),
	getters: {
		getComicSeriesData(state): Array<comicSeriesDataWithMetadataAndThumbnail> {
			return state.comicSeriesData;
		}
	},
  actions: {
	async fetchComicSeries(id:number) {
	  const authStore = useAuthStore()
	  const response = await authStore.apiFetch(
		`http://localhost:8000/api/comic-series/${id}`
	  )
	  const fullResponseData = await response.json()
	  this.comicSeriesData.push(fullResponseData.data)
	  
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
