<script setup lang="ts">
	import { computed, onMounted, ref, watch } from 'vue';
	import Button from 'primevue/button';

	import { apiClient } from '@/utilities/apiClient';

	const props = withDefaults(defineProps<{
		modelValue?: string;
	}>(), {
		modelValue: '',
	});

	const emit = defineEmits<{
		(event: 'update:modelValue', value: string): void;
	}>();

	const currentBrowsePath = ref('');
	const pathNavigationStack = ref<string[]>([]);
	const availableDirectories = ref<string[]>([]);
	const loadingDirectories = ref(false);
	const directoryError = ref<string | null>(null);
	const hasLoadedDirectories = ref(false);

	const selectedPath = computed({
		get: () => props.modelValue,
		set: (value: string) => emit('update:modelValue', value),
	});

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
			selectedPath.value = path ?? '';
		} catch (error) {
			directoryError.value = error instanceof Error
				? error.message
				: 'Failed to load directories.';
		} finally {
			loadingDirectories.value = false;
			hasLoadedDirectories.value = true;
		}
	};

	const getParentPath = (path: string): string | null => {
		const normalized = path.replace(/\\/g, '/').replace(/\/+$/, '');

		if (!normalized) {
			return null;
		}

		const lastSlashIndex = normalized.lastIndexOf('/');

		if (lastSlashIndex <= 0) {
			return '';
		}

		return normalized.slice(0, lastSlashIndex);
	};

	const canNavigateUp = computed(() => {
		if (loadingDirectories.value) {
			return false;
		}

		if (pathNavigationStack.value.length > 0) {
			return true;
		}

		return getParentPath(currentBrowsePath.value) !== null;
	});

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
		if (pathNavigationStack.value.length > 0) {
			const previousPath = pathNavigationStack.value.pop() ?? '';
			await fetchDirectories(previousPath || undefined);
			return;
		}

		const parentPath = getParentPath(currentBrowsePath.value);

		if (parentPath === null) {
			return;
		}

		await fetchDirectories(parentPath || undefined);
	};

	onMounted(async () => {
		await fetchDirectories(props.modelValue || undefined);
	});

	watch(
		() => props.modelValue,
		async (nextPath) => {
			const resolvedPath = nextPath || '';

			if (resolvedPath === currentBrowsePath.value && hasLoadedDirectories.value) {
				return;
			}

			pathNavigationStack.value = [];
			await fetchDirectories(resolvedPath || undefined);
		},
		{ immediate: true },
	);
</script>

<template>
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
					:disabled="!canNavigateUp"
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
				Selected: {{ selectedPath || 'None' }}
			</p>
		</div>
	</div>
</template>
