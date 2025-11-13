import { defineStore } from 'pinia'
import { apiClient } from '../utilities/apiClient'

export type LibraryData = {
	id: number;
	name: string;
	description: string | null;
	path: string;
	enabled: boolean;
	changed_at: string;
	created_at: string;
	updated_at: string;
}

// Convert LibraryData to objects compatible with MenuItem
function transformToMenuItems(libraries: Array<LibraryData>) {
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
    libraries: [] as Array<LibraryData>,
	}),
	getters: {
		getLibraries: (state) => state.libraries,
    	sidePanelLibraries: (state) => transformToMenuItems(state.libraries), // Dynamically generate side panel data
	},
	actions: {
		setLibraries(libraries: Array<LibraryData>) {
			this.libraries = libraries;
		},
		async requestUsersLibraries() {
			// The authorization header is automatically added by the apiClient middleware
			const { data, error } = await apiClient.GET('/comic-libraries', {
				params: {
					header: {
						authorization: '' // Will be overridden by middleware
					}
				}
			});

			if (error || !data) {
				throw new Error(error?.message || 'Failed to fetch libraries');
			}

			// Handle the response data which could be an array or single object
			const libraries: Array<LibraryData> = Array.isArray(data.data) 
				? data.data.map(lib => ({
					...lib,
					enabled: Boolean(lib.enabled) // Convert number to boolean
				}))
				: data.data 
					? [{
						...data.data,
						enabled: Boolean(data.data.enabled)
					}]
					: [];

			this.setLibraries(libraries);
		}
	}
})
