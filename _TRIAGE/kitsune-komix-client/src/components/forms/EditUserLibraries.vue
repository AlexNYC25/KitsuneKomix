<script setup lang="ts">
	import { reactive, watch } from 'vue';

	import FormModal from '@/components/ui/FormModal.vue';
	import type { ComicLibrary } from '@/types/comic-libraries.types';


	const props = defineProps<{
		libraries: Array<ComicLibrary>;
		initialAccessibleLibraryIds?: Array<number>;
		onCancel?: () => void;
		onSave?: (accessibleLibraryIds: Array<number>) => void | Promise<void>;
	}>();

	const emit = defineEmits<{
		'update:modelValue': [value: boolean]
	}>()

	const accessByLibraryId = reactive<Record<number, boolean>>({});

	watch(
		() => [props.libraries, props.initialAccessibleLibraryIds],
		() => {
			for (const key of Object.keys(accessByLibraryId)) {
				delete accessByLibraryId[Number(key)];
			}

			for (const library of props.libraries) {
				if (library.id === undefined) {
					continue;
				}

				accessByLibraryId[library.id] = props.initialAccessibleLibraryIds?.includes(library.id) ?? false;
			}
		},
		{ immediate: true },
	);

	const handleCancel = (): void => {
		emit('update:modelValue', false);
		props.onCancel?.();
	};

	const handleSaveLibraries = async (event: Event): Promise<void> => {
		event.preventDefault();

		const accessibleLibraryIds = Object.entries(accessByLibraryId)
			.filter(([, hasAccess]) => hasAccess)
			.map(([libraryId]) => Number(libraryId));

		await props.onSave?.(accessibleLibraryIds);
	};
</script>

<template>
	<FormModal
		title="Edit User Libraries"
		sizeClass="lg:w-[640px] lg:max-h-[520px]"
		:modelValue="true"
		@update:modelValue="handleCancel"
	>
		<form @submit="handleSaveLibraries">
			<div class="border rounded-md border-surface-overlay overflow-hidden">
				<div class="grid grid-cols-2 px-4 py-2 font-semibold bg-surface-base">
					<span>Library Name</span>
					<span class="text-center">Can Access</span>
				</div>

				<div class="max-h-[280px] overflow-y-auto">
					<div
						v-for="library in libraries"
						:key="library.id"
						class="grid grid-cols-2 px-4 py-3 border-t border-surface-overlay"
					>
						<span>{{ library.name }}</span>
						<div class="flex justify-center">
							<input
								v-if="library.id !== undefined"
								:id="`user-library-access-${library.id}`"
								v-model="accessByLibraryId[library.id]"
								type="checkbox"
								class="h-5 w-5 cursor-pointer"
							/>
						</div>
					</div>

					<div
						v-if="libraries.length === 0"
						class="px-4 py-6 text-sm text-text-muted"
					>
						No libraries available.
					</div>
				</div>
			</div>

			<div class="flex justify-center">
				<button
					type="submit"
					class="px-4 py-2 mx-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
				>
					Save Changes
				</button>

				<button
					type="button"
					class="px-4 py-2 mx-4 bg-surface-overlay hover:bg-surface-elevated text-text-primary rounded-md"
					@click="handleCancel"
				>
					Cancel
				</button>
			</div>
		</form>
	</FormModal>
</template>
