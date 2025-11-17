import { defineStore } from 'pinia'
import { apiClient } from '../utilities/apiClient'
import type { ComicLibrary } from '../types/comic-libraries.types'

import { DEFAULT_HEADER_AUTHORIZATION } from '../utilities/constants';

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

			// Handle the response data which could be an array or single object
			const libraries: Array<ComicLibrary> = Array.isArray(data.data) 
				? data.data.map(lib => ({
					...lib,
					enabled: lib.enabled as unknown as number // Keep as number from API
				}))
				: data.data 
					? [{
						...data.data,
						enabled: data.data.enabled as unknown as number
					}]
					: [];

			this.setLibraries(libraries);
		}
	}
})
