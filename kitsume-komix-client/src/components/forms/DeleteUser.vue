<script setup lang="ts">
	import { ref } from 'vue';
	import { useUsersStore } from '@/stores/users';

	import FormModal from '@/components/ui/FormModal.vue';

	const props = defineProps<{
		onCancel?: () => void;
		userId: number;
	}>();

	const emit = defineEmits<{
		'update:modelValue': [value: boolean]
	}>()

	const usersStore = useUsersStore();
	const isSubmitting = ref(false);

	const handleCancel = (): void => {
		emit('update:modelValue', false);
		props.onCancel?.();
	};

	const handleConfirmDelete = async (): Promise<void> => {
		isSubmitting.value = true;
		try {
			await usersStore.deleteUser(props.userId);
			emit('update:modelValue', false);
			props.onCancel?.();
		} catch (error) {
			console.error('Failed to delete user:', error);
		} finally {
			isSubmitting.value = false;
		}
	};
</script>

<template>
	<FormModal
		title="Delete User"
		sizeClass="lg:w-[520px]"
		borderColor="border-red-200 dark:border-red-900"
		padding="lg"
		:modelValue="true"
		@update:modelValue="handleCancel"
	>
		<p class="text-sm text-text-primary">
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
				class="px-4 py-2 mx-4 bg-surface-overlay hover:bg-surface-elevated text-text-primary rounded-md"
				@click="handleCancel"
			>
				Cancel
			</button>
		</div>
	</FormModal>
</template>
