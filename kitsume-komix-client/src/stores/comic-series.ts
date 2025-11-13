import { defineStore } from 'pinia'
import { apiClient } from '../utilities/apiClient'

type comicSeriesDataWithMetadataAndThumbnail = {
	id: number;
	name: string;
	description: string | null;
	folderPath: string;
	createdAt: string;
	updatedAt: string;
	thumbnailUrl?: string | null;
	metadata?: {
		writers?: string | null;
		pencillers?: string | null;
		inkers?: string | null;
		colorists?: string | null;
		letterers?: string | null;
		editors?: string | null;
		coverArtists?: string | null;
		publishers?: string | null;
		imprints?: string | null;
		genres?: string | null;
		characters?: string | null;
		teams?: string | null;
		locations?: string | null;
		storyArcs?: string | null;
		seriesGroups?: string | null;
	};
	comics?: Array<{
		id: number;
		libraryId: number;
		filePath: string;
		title: string | null;
		issueNumber: string | null;
		thumbnailUrl?: string | null;
		// ... other comic fields as needed
	}>;
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
