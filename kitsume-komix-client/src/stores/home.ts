import { defineStore } from 'pinia'
import { apiClient } from '../utilities/apiClient'

import { DEFAULT_HEADER_AUTHORIZATION } from '../utilities/constants';

type SeriesData = {
  id: number;
  name: string;
  description: string | null;
  folderPath: string;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl?: string | null;
}

export const useHomeStore = defineStore('home', {
  state: () => ({
    latestSeries: [] as SeriesData[],
    updatedSeries: [] as SeriesData[],
  }),
  getters: {
    getLatestSeries: (state) => state.latestSeries,
    getUpdatedSeries: (state) => state.updatedSeries,
  },
  actions: {
    async fetchLatestSeries() {
      try {
        const { data, error } = await apiClient.GET('/comic-series/latest', {
          params: {
            header: DEFAULT_HEADER_AUTHORIZATION
          }
        });

        if (error || !data) {
          throw new Error(error?.message || 'Failed to fetch latest series');
        }

        // We need to append the full URL to the thumbnail path to make it accessible
        this.latestSeries = data.data.map((series) => ({
          ...series,
          thumbnailUrl: series.thumbnailUrl 
            ? 'http://localhost:8000' + series.thumbnailUrl 
            : 'https://placehold.co/400x400/gray/white'
        }));
      } catch (error) {
        console.error('Error fetching latest series:', error);
        throw error;
      }
    },
    async fetchUpdatedSeries() {
      try {
        const { data, error } = await apiClient.GET('/comic-series/updated', {
          params: {
            header: DEFAULT_HEADER_AUTHORIZATION
          }
        });

        if (error || !data) {
          throw new Error(error?.message || 'Failed to fetch updated series');
        }

        // We need to append the full URL to the thumbnail path to make it accessible
        this.updatedSeries = data.data.map((series) => ({
          ...series,
          thumbnailUrl: series.thumbnailUrl 
            ? 'http://localhost:8000' + series.thumbnailUrl 
            : 'https://placehold.co/400x400/gray/white'
        }));
      } catch (error) {
        console.error('Error fetching updated series:', error);
        throw error;
      }
    },
  }
})
