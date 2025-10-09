import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

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
			const authStore = useAuthStore();
			const response = await authStore.apiFetch(
				'http://localhost:8000/api/comic-libraries'
			);
			const data = await response.json();
			const libraries: Array<LibraryData> = data.libraries;

			this.setLibraries(libraries);
		}
	}
})
