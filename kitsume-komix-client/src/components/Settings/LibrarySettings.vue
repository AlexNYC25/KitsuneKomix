<script setup lang="ts">
	import { computed, ref, onMounted } from 'vue';
	import Button from 'primevue/button';

	import LibraryPathNavigation from '@/components/Settings/LibraryPathNavigation.vue';
	import FormModal from '@/components/ui/FormModal.vue';
	import { useAuthStore } from '@/stores/auth';
	import { useLibrariesStore } from '@/stores/libraries';
	import { numberToDataSize } from '@/utilities/formatting';

	const authStore = useAuthStore();
	const librariesStore = useLibrariesStore();

	const libraries = computed(() => librariesStore.libraries);
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
		const library = librariesStore.libraries.find(library => library.id === libraryId);

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
		if (librariesStore.libraries.length === 0 && isAdmin.value) {
			try {
				await librariesStore.requestUsersLibraries();
			} catch (error) {
				console.error('Failed to load libraries for settings page:', error);
			}
		}
	});
</script>

<template>
  <div v-if="isAdmin" id="libraries-section" class="bg-surface-elevated rounded-lg shadow-md p-6">
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
		<FormModal
			v-model="showAddLibraryForm"
			title="Add New Library"
			sizeClass="lg:w-[520px] lg:h-[475px]"
		>
			<form @submit.prevent="submitAddLibraryForm">
				<div>
					<label for="library-name" class="block text-sm font-medium mb-1">Library Name</label>
					<input
						id="library-name"
						v-model="newLibraryName"
						type="text"
						placeholder="e.g. My Comics"
						class="w-full px-3 py-2 border rounded-md bg-surface-elevated border-surface-overlay"
					/>
				</div>

				<div>
					<label for="library-description" class="block text-sm font-medium mb-1">Library Description</label>
					<input
						id="library-description"
						v-model="newLibraryDescription"
						type="text"
						placeholder="e.g. My Comics Description"
						class="w-full px-3 py-2 border rounded-md bg-surface-elevated border-surface-overlay"
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
		</FormModal>

		<!-- Edit Library Form -->
		<FormModal
			v-model="showEditLibraryForm"
			title="Edit Library"
			sizeClass="lg:w-[520px] lg:h-[520px]"
		>
			<form @submit.prevent="submitEditLibraryForm">
				<div>
					<label for="library-name-edit" class="block text-sm font-medium mb-1">Library Name</label>
					<input
						id="library-name-edit"
						v-model="editLibraryName"
						type="text"
						placeholder="e.g. My Comics"
						class="w-full px-3 py-2 border rounded-md bg-surface-elevated border-surface-overlay"
					/>
				</div>

				<div>
					<label for="library-description-edit" class="block text-sm font-medium mb-1">Library Description</label>
					<input
						id="library-description-edit"
						v-model="editLibraryDescription"
						type="text"
						placeholder="e.g. My Comics Description"
						class="w-full px-3 py-2 border rounded-md bg-surface-elevated border-surface-overlay"
					/>
				</div>

				<div class="flex items-left gap-2">
					<label for="library-enabled-edit" class="block text-sm font-medium">Library Enabled</label>
					<input
						id="library-enabled-edit"
						v-model="editLibraryEnabled"
						type="checkbox"
						class="px-3 py-2 border rounded-md bg-surface-elevated border-surface-overlay"
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
		</FormModal>

		<!-- Libraries List -->
		<div v-if="libraries.length === 0" class="text-text-muted">
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
				<p class="text-sm text-text-muted break-all">
					Library Path: {{ library.path }}
				</p> 

				<div class="grid grid-cols-5 gap-2 mt-6">
					<div class="col-span-2 grid grid-rows-2 gap-2">
						<div><p class="text-text-secondary">Number of Comic Series: {{ library.totalNumberOfSeries}}</p></div>
						<div><p class="text-text-secondary">Number of Comic Books: {{ library.totalNumberOfBooks }}</p></div>
					</div>

					<div class="col-span-2 grid grid-rows-2 gap-2">
						<div><p class="text-text-secondary">Total Library Size: {{ numberToDataSize(library.totalSize) }}</p></div>
						<div><p class="text-text-secondary">Number of Users: {{ library.totalNumberOfUsers }}</p></div>
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