<script setup lang="ts">
	import { computed, ref, onMounted } from 'vue';
	import Button from 'primevue/button';

	import LibraryPathNavigation from '@/components/Settings/LibraryPathNavigation.vue';
	import { useAuthStore } from '@/stores/auth';
	import { useLibrariesStore } from '@/stores/libraries';
	import { numberToDataSize } from '@/utilities/formating';

	const authStore = useAuthStore();
	const librariesStore = useLibrariesStore();

	const libraries = computed(() => librariesStore.getLibraries);
	const isAdmin = computed(() => Boolean(authStore.user?.admin));

	const showAddLibraryForm = ref(false);
	const newLibraryName = ref('');
	const selectedLibraryPath = ref('');
	const isSavingLibrary = ref(false);
	const newLibraryDescription = ref<string | null>(null);

	const showEditLibraryForm = ref(false);
	const editLibraryId = ref<number | null>(null);
	const editLibraryName = ref('');
	const editLibraryPath = ref('')
	const isEditingLibrary = ref(false);
	const editLibraryDescription = ref<string | null>(null);
	const editLibraryEnabled = ref<boolean>(false);
	
	const addLibraryError = ref<string | null>(null);
	const editLibraryError = ref<string | null>(null);

	const handleAddLibrary = async () => {
		showAddLibraryForm.value = true;
		addLibraryError.value = null;
		selectedLibraryPath.value = '';
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
				description: newLibraryDescription.value ?? undefined,
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
				description: editLibraryDescription.value ?? undefined,
				enabled: editLibraryEnabled.value,
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
		addLibraryError.value = null;
		newLibraryDescription.value = null;
	};

	const resetEditLibraryForm = () => {
		editLibraryId.value = null;
		showEditLibraryForm.value = false;
		editLibraryName.value = '';
		editLibraryPath.value = '';
		isEditingLibrary.value = false;
		editLibraryError.value = null;
		editLibraryDescription.value = null;
		editLibraryEnabled.value = false;
		editLibraryError.value = null;
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
			editLibraryDescription.value = library.description ?? null;
			editLibraryEnabled.value = library.enabled ?? false;
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
		if (librariesStore.getLibraries.length === 0 && isAdmin.value) {
			try {
				await librariesStore.requestUsersLibraries();
			} catch (error) {
				console.error('Failed to load libraries for settings page:', error);
			}
		}
	});
</script>

<template>
  <div v-if="isAdmin" id="libraries-section" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
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
			class="lg:w-[520px] lg:h-[475px] flex flex-col fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 mb-6 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-white dark:bg-gray-900"
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
				<label for="library-description" class="block text-sm font-medium mb-1">Library Description</label>
				<input
					id="library-description"
					v-model="newLibraryDescription"
					type="text"
					placeholder="e.g. My Comics Description"
					class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
				/>

			</div>

			<div>
				<LibraryPathNavigation v-model="selectedLibraryPath" />
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
			class="lg:w-[520px] lg:h-[520px] flex flex-col fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 mb-6 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-white dark:bg-gray-900"
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
				<label for="library-description-edit" class="block text-sm font-medium mb-1">Library Description</label>
				<input
					id="library-description-edit"
					v-model="editLibraryDescription"
					type="text"
					placeholder="e.g. My Comics Description"
					class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
				/>
			</div>

			<div class="flex items-left gap-2">
				<label for="library-enabled-edit" class="block text-sm font-medium">Library Enabled</label>
				<input
					id="library-enabled-edit"
					v-model="editLibraryEnabled"
					type="checkbox"
					class="px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
				/>
			</div>

			<div>
				<LibraryPathNavigation v-model="editLibraryPath" />
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

		<!-- Libraries List -->
		<div v-if="libraries.length === 0" class="text-gray-600 dark:text-gray-400">
			<p>No libraries found.</p>
		</div>

		<div
			v-else
			class="flex flex-col gap-4 w-full"
		>
			<div
				v-for="library in libraries"
				:key="library.id"
				class="border rounded-lg p-4 w-full"
				:class="{'border-blue-500': library.enabled, 'border-red-500': !library.enabled}"
			>
				<h3 class="text-lg font-semibold mb-1">{{ library.name }} {{ library.description ? `- ${library.description}` : '' }}</h3>
				<p class="text-sm text-gray-600 dark:text-gray-400 break-all">
					Library Path: {{ library.path }}
				</p> 

				<div class="grid grid-cols-5 gap-2 mt-6">
					<div class="col-span-2 grid grid-rows-2 gap-2">
						<div><p class="text-gray-500 dark:text-gray-300">Number of Comic Series: {{ library.totalNumberOfSeries}}</p></div>
						<div><p class="text-gray-500 dark:text-gray-300">Number of Comic Books: {{ library.totalNumberOfBooks }}</p></div>
					</div>

					<div class="col-span-2 grid grid-rows-2 gap-2">
						<div><p class="text-gray-500 dark:text-gray-300">Total Library Size: {{ numberToDataSize(library.totalSize) }}</p></div>
						<div><p class="text-gray-500 dark:text-gray-300">Number of Users: {{ library.totalNumberOfUsers }}</p></div>
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