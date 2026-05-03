<script setup lang="ts">
	import { ref } from 'vue';
	import { useUsersStore } from '@/stores/users';

	const props = defineProps<{
		onCancel?: () => void;
		userId: number;
	}>();

	const usersStore = useUsersStore();
	const isSubmitting = ref(false);

	const handleCancel = (): void => {
		props.onCancel?.();
	};

	const handleConfirmDelete = async (): Promise<void> => {
		isSubmitting.value = true;
		try {
			await usersStore.deleteUser(props.userId);
			props.onCancel?.();
		} finally {
			isSubmitting.value = false;
		}
	};
</script>

<template>
	<div
		class="lg:w-[520px] lg:h-[220px] flex flex-col fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 mb-6 shadow-2xl border border-red-200 dark:border-red-900 rounded-lg p-6 space-y-6 bg-white dark:bg-gray-900"
	>
		<h3 class="text-lg font-semibold">Delete User</h3>

		<p class="text-sm text-gray-700 dark:text-gray-300">
			Are you sure you want to delete this user?
		</p>

		<div class="flex justify-center">
			<button
				type="button"
				:disabled="isSubmitting"
				class="px-4 py-2 mx-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
				@click="handleConfirmDelete"
			>
				Delete User
			</button>

			<button
				type="button"
				class="px-4 py-2 mx-4 bg-gray-500 text-white rounded-md hover:bg-gray-600"
				@click="handleCancel"
			>
				Cancel
			</button>
		</div>
	</div>
</template>
