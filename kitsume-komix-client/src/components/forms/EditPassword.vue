<script setup lang="ts">
	import { useForm } from 'vee-validate';

	import { useUsersStore } from '@/stores/users';
	import { userPasswordEditSchema } from '@/zod/users.schema';

	import FormModal from '@/components/ui/FormModal.vue';

	const props = defineProps<{
		onCancel?: () => void;
		userId: number;
	}>();

	const emit = defineEmits<{
		'update:modelValue': [value: boolean]
	}>()

	const usersStore = useUsersStore();

	const {
		defineField,
		handleSubmit,
		isSubmitting,
		resetForm,
	} = useForm({
		validationSchema: userPasswordEditSchema,
		initialValues: {
			newPassword: '',
			confirmPassword: '',
		},
	});

	const [editedUserPassword, editedUserPasswordAttrs] = defineField('newPassword');
	const [editedUserPasswordConfirmation, editedUserPasswordConfirmationAttrs] = defineField('confirmPassword');

	const handleCancel = (): void => {
		resetForm();
		emit('update:modelValue', false);
		props.onCancel?.();
	};

	const handleUpdatePassword = handleSubmit(async (values) => {
		const targetUser = usersStore.users.find((user) => user.id === props.userId);

		if (!targetUser?.email) {
			console.error('Unable to update user password: user not found.');
			return;
		}

		try {
			await usersStore.updateExistingUser({
				id: props.userId,
				email: targetUser.email,
				admin: Boolean(targetUser.admin),
				password: values.newPassword,
			});
			resetForm();
			emit('update:modelValue', false);
			props.onCancel?.();
		} catch (error) {
			console.error('Failed to update password:', error);
		}
	});
</script>

<template>
	<FormModal
		title="Edit User Password"
		sizeClass="lg:w-[520px] lg:h-[280px]"
		:modelValue="true"
		@update:modelValue="handleCancel"
	>
		<form @submit="handleUpdatePassword">
			<div>
				<label for="edit-user-password" class="block text-sm font-medium mb-1">New Password</label>
				<input
					id="edit-user-password"
					v-model="editedUserPassword"
					type="password"
					placeholder="Enter new password"
					class="w-full px-3 py-2 border rounded-md bg-surface-elevated"
					:class="editedUserPasswordAttrs.error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-surface-overlay'"
				/>
				<p v-if="editedUserPasswordAttrs.error" class="mt-1 text-sm text-red-500">{{ editedUserPasswordAttrs.error }}</p>
			</div>

			<div>
				<label for="edit-user-password-confirmation" class="block text-sm font-medium mb-1">Confirm New Password</label>
				<input
					id="edit-user-password-confirmation"
					v-model="editedUserPasswordConfirmation"
					type="password"
					placeholder="Confirm new password"
					class="w-full px-3 py-2 border rounded-md bg-surface-elevated"
					:class="editedUserPasswordConfirmationAttrs.error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-surface-overlay'"
				/>
				<p v-if="editedUserPasswordConfirmationAttrs.error" class="mt-1 text-sm text-red-500">{{ editedUserPasswordConfirmationAttrs.error }}</p>
			</div>

			<div class="flex justify-center">
				<button
					type="submit"
					:disabled="isSubmitting"
					class="px-4 py-2 mx-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
				>
					Save Password
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
