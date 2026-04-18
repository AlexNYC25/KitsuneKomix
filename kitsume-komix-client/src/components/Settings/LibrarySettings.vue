<script setup lang="ts">
	import { computed, ref, onMounted } from 'vue';
	import Button from 'primevue/button';

	import { useAuthStore } from '@/stores/auth';
	import { useLibrariesStore } from '@/stores/libraries';
	import { apiClient } from '@/utilities/apiClient';

	const authStore = useAuthStore();
	const librariesStore = useLibrariesStore();

	const libraries = computed(() => librariesStore.getLibraries);
	const isAdmin = computed(() => Boolean(authStore.user?.admin));

	const showAddLibraryForm = ref(false);
	const newLibraryName = ref('');
	const selectedLibraryPath = ref('');
	const isSavingLibrary = ref(false);

	const currentBrowsePath = ref('');

	const pathNavigationStack = ref<string[]>([]);
	const availableDirectories = ref<string[]>([]);
	const loadingDirectories = ref(false);

	const showEditLibraryForm = ref(false);
	const editLibraryId = ref<number | null>(null);
	const editLibraryName = ref('');
	const editLibraryPath = ref('')
	const isEditingLibrary = ref(false);
	
	const addLibraryError = ref<string | null>(null);
	const directoryError = ref<string | null>(null);
	const editLibraryError = ref<string | null>(null);

	const fetchDirectories = async (path?: string) => {
		loadingDirectories.value = true;
		directoryError.value = null;

		try {
			const { data, error } = await apiClient.POST('/comic-libraries/find-path', {
				body: path ? { path } : {},
			});

			if (error || !data) {
				throw new Error(error?.message || 'Failed to load directories.');
			}

			availableDirectories.value = data.directories ?? [];
			currentBrowsePath.value = path ?? '';
			selectedLibraryPath.value = path ?? '';
		} catch (error) {
			directoryError.value = error instanceof Error
				? error.message
				: 'Failed to load directories.';
		} finally {
			loadingDirectories.value = false;
		}
	};

	const handleAddLibrary = async () => {
		showAddLibraryForm.value = true;
		addLibraryError.value = null;
		pathNavigationStack.value = [];
		await fetchDirectories();
	};

	const submitAddLibraryForm = async () => {
		const name = newLibraryName.value.trim();
		const path = selectedLibraryPath.value.trim();

		if (!name || !path) {
			addLibraryError.value = 'Library name and library path are required.';
			return;
		}

		isSavingLibrary.value = true;
		addLibraryError.value = null;

		try {
			await librariesStore.createLibrary({
				name,
				path,
			});

			resetAddLibraryForm();
		} catch (error) {
			addLibraryError.value = error instanceof Error
				? error.message
				: 'Failed to create library.';
		} finally {
			isSavingLibrary.value = false;
		}
	};

	const submitEditLibraryForm = async () => {
		const name = editLibraryName.value.trim();
		const path = editLibraryPath.value.trim();

		if (!name || !path) {
			editLibraryError.value = 'Library name and library path are required.';
			return;
		}

		isEditingLibrary.value = true;
		editLibraryError.value = null;

		try {
			if (isNaN(editLibraryId.value ?? NaN ) || editLibraryId.value === null) {
				throw new Error('Invalid library ID.');
			}

			await librariesStore.updateLibrary({
				id: editLibraryId.value,
				name,
				path,
			});

			resetEditLibraryForm();
		} catch (error) {
			editLibraryError.value = error instanceof Error
				? error.message
				: 'Failed to update library.';
		} finally {
			isEditingLibrary.value = false;
		}
	};

	const resetAddLibraryForm = () => {
		showAddLibraryForm.value = false;
		newLibraryName.value = '';
		selectedLibraryPath.value = '';
		currentBrowsePath.value = '';
		pathNavigationStack.value = [];
		availableDirectories.value = [];
		directoryError.value = null;
		addLibraryError.value = null;
	};

	const resetEditLibraryForm = () => {
		editLibraryId.value = null;
		showEditLibraryForm.value = false;
		editLibraryName.value = '';
		editLibraryPath.value = '';
		isEditingLibrary.value = false;
		editLibraryError.value = null;
		currentBrowsePath.value = '';
		pathNavigationStack.value = [];
		availableDirectories.value = [];
		directoryError.value = null;
		editLibraryError.value = null;
	};


	const getDirectoryName = (directoryPath: string): string => {
		const normalized = directoryPath.replace(/\\/g, '/').replace(/\/+$/, '');
		const segments = normalized.split('/').filter(Boolean);
		return segments.length > 0 ? segments[segments.length - 1] : directoryPath;
	};

	const openDirectory = async (directoryPath: string) => {
		pathNavigationStack.value.push(currentBrowsePath.value);
		await fetchDirectories(directoryPath);
	};

	const navigateUpDirectory = async () => {
		if (pathNavigationStack.value.length === 0) {
			return;
		}

		const previousPath = pathNavigationStack.value.pop() ?? '';
		await fetchDirectories(previousPath || undefined);
	};

	const handleEditLibrary = async (libraryId: number) => {
		// Implement edit library functionality here
		showEditLibraryForm.value = true;

		// fill in the form values
		const library = librariesStore.getLibraries.find(library => library.id === libraryId);

		if (library) {
			editLibraryName.value = library.name;
			editLibraryPath.value = library.path;
			editLibraryId.value = library.id ?? null;

			openDirectory(library.path);
		}

	};


	const handleDeleteLibrary = async (libraryId: number) => {
		try {
			await librariesStore.deleteLibrary(libraryId);
		} catch (error) {
			console.error('Failed to delete library:', error);
		}
	};


	onMounted(async () => {
		if (librariesStore.getLibraries.length === 0) {
			try {
				await librariesStore.requestUsersLibraries();
			} catch (error) {
				console.error('Failed to load libraries for settings page:', error);
			}
		}
	});
</script>

<template>
  <div id="libraries-section" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-2xl font-semibold">Libraries</h2>

			<Button
				v-if="isAdmin"
				label="Add Library"
				icon="pi pi-plus"
				severity="info"
				@click="handleAddLibrary"
			/>
		</div>

		<!-- Add Library Form -->
		<form
			v-if="showAddLibraryForm && isAdmin"
			class="lg:w-[520px] lg:h-[400px] flex flex-col fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 mb-6 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-white dark:bg-gray-900"
			@submit.prevent="submitAddLibraryForm"
		>
			<h3 class="text-lg font-semibold">Add New Library</h3>

			<div>
				<label for="library-name" class="block text-sm font-medium mb-1">Library Name</label>
				<input
					id="library-name"
					v-model="newLibraryName"
					type="text"
					placeholder="e.g. My Comics"
					class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
				/>
			</div>

			<div>
				<label class="block text-sm font-medium mb-2">Library Path</label>

				<div class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
					<div class="flex items-center justify-between gap-2">
						<p class="text-xs text-gray-600 dark:text-gray-400 break-all">
							Current: {{ currentBrowsePath || 'App Comic Directory Base' }}
						</p>
						<Button
							type="button"
							label="Up"
							icon="pi pi-arrow-up"
							severity="secondary"
							text
							size="small"
							@click="navigateUpDirectory"
							:disabled="loadingDirectories || pathNavigationStack.length === 0"
						/>
					</div>

					<div v-if="directoryError" class="text-sm text-red-500">
						{{ directoryError }}
					</div>

					<div v-else-if="loadingDirectories" class="text-sm text-gray-600 dark:text-gray-400">
						Loading directories...
					</div>

					<div v-else-if="availableDirectories.length === 0" class="text-sm text-gray-600 dark:text-gray-400">
						No subdirectories found.
					</div>

					<div v-else class="max-h-48 overflow-y-auto space-y-2">
						<button
							v-for="directoryPath in availableDirectories"
							:key="directoryPath"
							type="button"
							class="w-full text-left px-3 py-2 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
							@click="openDirectory(directoryPath)"
						>
							{{ getDirectoryName(directoryPath) }}
						</button>
					</div>

					<p class="text-xs text-gray-600 dark:text-gray-400 break-all">
						Selected: {{ selectedLibraryPath || 'None' }}
					</p>
				</div>
			</div>

			<p v-if="addLibraryError" class="text-sm text-red-500">{{ addLibraryError }}</p>

			<div class="flex items-center gap-2">
				<Button
					type="submit"
					label="Save Library"
					icon="pi pi-check"
					severity="info"
					:loading="isSavingLibrary"
				/>
				<Button
					type="button"
					label="Cancel"
					icon="pi pi-times"
					severity="secondary"
					text
					@click="resetAddLibraryForm"
					:disabled="isSavingLibrary"
				/>
			</div>
		</form>

		<!-- Edit Library Form -->
		<form
			v-if="showEditLibraryForm && isAdmin"
			class="lg:w-[520px] lg:h-[400px] flex flex-col fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 mb-6 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-white dark:bg-gray-900"
			@submit.prevent="submitEditLibraryForm"
		>
			<h3 class="text-lg font-semibold">Edit Library</h3>

			<div>
				<label for="library-name-edit" class="block text-sm font-medium mb-1">Library Name</label>
				<input
					id="library-name-edit"
					v-model="editLibraryName"
					type="text"
					placeholder="e.g. My Comics"
					class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
				/>
			</div>

			<div>
				<label class="block text-sm font-medium mb-2">Library Path</label>

				<div class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
					<div class="flex items-center justify-between gap-2">
						<p class="text-xs text-gray-600 dark:text-gray-400 break-all">
							Current: {{ editLibraryPath || 'App Comic Directory Base' }}
						</p>
						<Button
							type="button"
							label="Up"
							icon="pi pi-arrow-up"
							severity="secondary"
							text
							size="small"
							@click="navigateUpDirectory"
							:disabled="loadingDirectories || pathNavigationStack.length === 0"
						/>
					</div>

					<div v-if="directoryError" class="text-sm text-red-500">
						{{ directoryError }}
					</div>

					<div v-else-if="loadingDirectories" class="text-sm text-gray-600 dark:text-gray-400">
						Loading directories...
					</div>

					<div v-else-if="availableDirectories.length === 0" class="text-sm text-gray-600 dark:text-gray-400">
						No subdirectories found.
					</div>

					<div v-else class="max-h-48 overflow-y-auto space-y-2">
						<button
							v-for="directoryPath in availableDirectories"
							:key="directoryPath"
							type="button"
							class="w-full text-left px-3 py-2 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
							@click="openDirectory(directoryPath)"
						>
							{{ getDirectoryName(directoryPath) }}
						</button>
					</div>

					<p class="text-xs text-gray-600 dark:text-gray-400 break-all">
						Selected: {{ selectedLibraryPath || 'None' }}
					</p>
				</div>
			</div>

			<p v-if="editLibraryError" class="text-sm text-red-500">{{ editLibraryError }}</p>

			<div class="flex items-center gap-2">
				<Button
					type="submit"
					label="Save Library"
					icon="pi pi-check"
					severity="info"
					:loading="isEditingLibrary"
				/>
				<Button
					type="button"
					label="Cancel"
					icon="pi pi-times"
					severity="secondary"
					text
					@click="resetEditLibraryForm"
					:disabled="isEditingLibrary"
				/>
			</div>
		</form>

		<div v-if="libraries.length === 0" class="text-gray-600 dark:text-gray-400">
			No libraries found.
		</div>

		<div
			v-else
			class="flex flex-col gap-4 w-full"
		>
			<div
				v-for="library in libraries"
				:key="library.id"
				class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 w-full"
			>
				<h3 class="text-lg font-semibold mb-1">{{ library.name }}</h3>
				<p class="text-sm text-gray-600 dark:text-gray-400 break-all">
					Library Path: {{ library.path }}
				</p>
				<div class="grid grid-cols-5 gap-2 mt-6">
					<div class="col-span-2 grid grid-rows-2 gap-2">
						<div><p class="text-gray-500 dark:text-gray-300">Number of Comic Series</p></div>
						<div><p class="text-gray-500 dark:text-gray-300">Number of Comic Books</p></div>
					</div>

					<div class="col-span-2 grid grid-rows-2 gap-2">
						<div><p class="text-gray-500 dark:text-gray-300">Total Library Size</p></div>
						<div><p class="text-gray-500 dark:text-gray-300">Number of Users</p></div>
					</div>

					<!-- Library Actions -->
					<div class="col-span-1 grid grid-rows-2 gap-2">
						<Button
							type="button"
							label="Edit"
							icon="pi pi-pencil"
							severity="secondary"
							text
							size="small"
							@click="library.id !== undefined && handleEditLibrary(library.id)"
						/>
						<Button
							type="button"
							label="Delete"
							icon="pi pi-trash"
							severity="danger"
							text
							size="small"
							@click="library.id !== undefined && handleDeleteLibrary(library.id)"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>