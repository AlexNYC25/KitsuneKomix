import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useHomeStore = defineStore('home', {
  state: () => ({
    latestSeries: []
  }),
  getters: {
    // define your getters here
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
        
        console.log('Fetching latest series with token:', authStore.token ? 'Token exists' : 'No token');
        
        const response = await authStore.apiFetch('http://localhost:8000/api/comic-series/latest');
        
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        
        const responseData = await response.json();
        this.latestSeries = responseData.data;
      } catch (error) {
        console.error('Error fetching latest series:', error);
        throw error;
      }
    }
  }
})
