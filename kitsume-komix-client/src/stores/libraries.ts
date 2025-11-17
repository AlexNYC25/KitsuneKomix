import { defineStore } from 'pinia'
import { apiClient } from '../utilities/apiClient'
import { DEFAULT_HEADER_AUTHORIZATION } from '../utilities/constants'
import type { ComicLibrary } from '../types/comic-libraries.types'

// Convert ComicLibrary to objects compatible with MenuItem
function transformToMenuItems(libraries: Array<ComicLibrary>) {
	return libraries.map((library) => ({
		label: library.name,
		items: [
			{ label: 'Latest Comics', icon: 'md-menubook-sharp' },
			{ label: 'Latest Series', icon: 'io-library-sharp' },
			{ label: 'All Comics', icon: 'md-menubook-sharp' },
			{ label: 'All Comic Series', icon: 'io-library-sharp' },
			{ label: 'All Comic Series Groups', icon: 'hi-solid-library' },
			{ label: 'All Comic Readlists', icon: 'md-librarybooks-sharp' }
		]
	}));
}

export const useLibrariesStore = defineStore('libraries', {
	state: () => ({
		libraries: [] as Array<ComicLibrary>,
	}),
	getters: {
		getLibraries: (state) => state.libraries,
		sidePanelLibraries: (state) => transformToMenuItems(state.libraries), // Dynamically generate side panel data
	},
	actions: {
		setLibraries(libraries: Array<ComicLibrary>) {
			this.libraries = libraries;
		},
		async requestUsersLibraries() {
			// The authorization header is automatically added by the apiClient middleware
			const { data, error } = await apiClient.GET('/comic-libraries', {
				params: {
					header: DEFAULT_HEADER_AUTHORIZATION
				}
			});

			if (error || !data) {
				throw new Error(error?.message || 'Failed to fetch libraries');
			}

			// API always returns data as an array now
			const libraries: Array<ComicLibrary> = Array.isArray(data.data)
				? data.data
				: [];

			this.setLibraries(libraries);
		}
	}
})
