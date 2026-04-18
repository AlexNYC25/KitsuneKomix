import { defineStore } from 'pinia'
import { apiClient } from '../utilities/apiClient'

import type { ComicLibrary, CreateLibraryPayload, UpdateLibraryPayload } from '../types/comic-libraries.types'


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
		async createLibrary(payload: CreateLibraryPayload): Promise<boolean> {
			const { data, error } = await apiClient.POST('/comic-libraries/create-library', {
				body: {
					name: payload.name,
					path: payload.path,
					description: payload.description ?? undefined,
				}
			});

			if (error || !data?.success) {
				throw new Error(error?.message || 'Failed to create library');
			}

			await this.requestUsersLibraries();

			return true;
		},
		async updateLibrary(payload: UpdateLibraryPayload): Promise<boolean> {
			const { data, error } = await apiClient.POST('/comic-libraries/update-library/{id}', {
				params: {
					path: {
						id: String(payload.id)
					}
				},
				body: {
					id: payload.id,
					name: payload.name,
					path: payload.path,
					description: payload.description ?? undefined,
				}
			});

			if (error) {
				throw new Error(error?.message || 'Failed to update library');
			}

			if (data) {
				await this.requestUsersLibraries();
				return true;
			}

			return false;
			
		},
		async requestUsersLibraries() {
			// The authorization header is automatically added by the apiClient middleware
			const { data, error } = await apiClient.GET('/comic-libraries');

			if (error || !data) {
				throw new Error(error?.message || 'Failed to fetch libraries');
			}

			const librariesPayload = (data as { libraries?: Array<ComicLibrary>; data?: Array<ComicLibrary> });

			const libraries: Array<ComicLibrary> = Array.isArray(librariesPayload.libraries)
				? librariesPayload.libraries
				: Array.isArray(librariesPayload.data)
					? librariesPayload.data
					: [];

			this.setLibraries(libraries);
		},
		async deleteLibrary(libraryId: number): Promise<boolean> {
			const { data, error } = await apiClient.DELETE('/comic-libraries/delete-library/{id}', {
				params: {
					path: {
						id: String(libraryId)
					}
				}
			});

			if (error || !data) {
				throw new Error(error?.message || 'Failed to delete library');
			}

			await this.requestUsersLibraries();

			return true;
		}

	}
})
