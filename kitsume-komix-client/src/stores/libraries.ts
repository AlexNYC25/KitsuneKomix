import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useLibrariesStore = defineStore('libraries', {
  state: () => ({
    libraries: [] as Array<string>
	}),
	getters: {
		getLibraries: (state) => state.libraries
	},
	actions: {
		setLibraries(libraries: Array<string>) {
			this.libraries = libraries
		},
		async requestUsersLibraries() {
			const authStore = useAuthStore();
			const response = await authStore.apiFetch(
				'http://localhost:8000/api/comic-libraries'
			)
			const data = await response.json();

			//TODO: handle the actual data structure returned by the API
			console.log(data)
		}
	}
})
