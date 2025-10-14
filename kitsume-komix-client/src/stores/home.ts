import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

type SeriesData = {
  id: number;
  name: string;
  description: string | null;
  folderPath: string;
  created_at: string;
  updated_at: string;
  thumbnailUrl?: string;
}

export const useHomeStore = defineStore('home', {
  state: () => ({
    latestSeries: [] as SeriesData[]
  }),
  getters: {
    getLatestSeries: (state) => state.latestSeries,
  },
  actions: {
    async fetchLatestSeries() {
      try {
        const authStore = useAuthStore();
        
        if (!authStore.isAuthenticated) {
          throw new Error('User is not authenticated');
        }

        if (!authStore.token) {
          throw new Error('No authentication token available');
        }
                
        const response = await authStore.apiFetch('http://localhost:8000/api/comic-series/latest');
        
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        
        const responseData = await response.json();

        // We need to append the full URL to the thumbnail path to make it accessible
        this.latestSeries = responseData.data.map((series: SeriesData) => ({
          ...series,
          thumbnailUrl: 'http://localhost:8000' + series.thumbnailUrl || 'https://placehold.co/400x400/gray/white'
        }));
      } catch (error) {
        console.error('Error fetching latest series:', error);
        throw error;
      }
    }
  }
})
