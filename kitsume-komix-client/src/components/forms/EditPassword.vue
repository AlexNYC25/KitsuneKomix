<script setup lang="ts">
	import { useForm } from 'vee-validate';

	import { useUsersStore } from '@/stores/users';
	import { userPasswordEditSchema } from '@/zod/users.schema';

	const props = defineProps<{
		onCancel?: () => void;
		userId: number;
	}>();

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
		props.onCancel?.();
	};

	const handleUpdatePassword = handleSubmit(async (values) => {
		const targetUser = usersStore.getUsers.find((user) => user.id === props.userId);

		if (!targetUser?.email) {
			console.error('Unable to update user password: user not found.');
			return;
		}

		await usersStore.updateExistingUser({
			id: props.userId,
			email: targetUser.email,
			admin: Boolean(targetUser.admin),
			password: values.newPassword,
		});
		resetForm();
		props.onCancel?.();
	});
</script>

<template>
	<form
		class="lg:w-[520px] lg:h-[280px] flex flex-col fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 mb-6 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-white dark:bg-gray-900"
		@submit="handleUpdatePassword"
	>
		<h3 class="text-lg font-semibold">Edit User Password</h3>

		<div>
			<label for="edit-user-password" class="block text-sm font-medium mb-1">New Password</label>
			<input
				id="edit-user-password"
				v-model="editedUserPassword"
				type="password"
				placeholder="Enter new password"
				class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
				:class="editedUserPasswordAttrs.error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'"
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
				class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
				:class="editedUserPasswordConfirmationAttrs.error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'"
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
				class="px-4 py-2 mx-4 bg-gray-500 text-white rounded-md hover:bg-gray-600"
				@click="handleCancel"
			>
				Cancel
			</button>
		</div>
	</form>
</template>
