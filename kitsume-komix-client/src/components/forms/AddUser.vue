<script setup lang="ts">
	import { useForm } from 'vee-validate';

	import { useUsersStore } from '@/stores/users';

	import { userSignUpSchema }	from '@/zod/users.schema';

	const props = defineProps<{
		onCancel?: () => void;
	}>();

	const usersStore = useUsersStore();

	const { defineField, handleSubmit, errors, resetForm } = useForm({
		validationSchema: userSignUpSchema,
		initialValues: {
			userEmail: '',
			userRole: 'user',
			userPassword: ''
		}
	});

	const [newUserEmail] = defineField('userEmail');
	const [newUserRole] = defineField('userRole');
	const [newUserPassword] = defineField('userPassword');

	const handleCancel = (): void => {
		resetForm();
		props.onCancel?.();
	};

	const handleAddUser = handleSubmit(async (values) => {
		console.log('Form submitted with values:', values);
		await usersStore.registerNewUser({
			username: values.userEmail, // Using email as username for simplicity
			email: values.userEmail,
			password: values.userPassword,
			admin: values.userRole === "admin"
		});
		resetForm();
		props.onCancel?.();

	});


</script>

<template>
	<form
		class="lg:w-lg lg:h-lg flex flex-col fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 mb-6 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-white dark:bg-gray-900"
		@submit="handleAddUser"
	>
		<h3 class="text-lg font-semibold">Add User</h3>

		<!-- New User's Email -->
		<div>
			<label for="new-user-email" class="block text-sm font-medium mb-1">Email</label>
			<input
				id="new-user-email"
				v-model="newUserEmail"
				type="email"
				placeholder="e.g. user@example.com"
				class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
			/>
		</div>

		<!-- New User's Role i.e. admin or not -->
		<div>
			<label for="new-user-role" class="block text-sm font-medium mb-1">Role</label>
			<select
				id="new-user-role"
				v-model="newUserRole"
				class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
			>
				<option value="user">User</option>
				<option value="admin">Admin</option>
			</select>
		</div>

		<!-- New User's Password -->
		<div>
			<label for="new-user-password" class="block text-sm font-medium mb-1">Password</label>
			<input
				id="new-user-password"
				v-model="newUserPassword"
				type="password"
				placeholder="Enter a password"
				class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
			/>
		</div>

		<!-- Form's Buttons -->
		<div
			class="flex justify-center"
		>
			<button
				type="submit"
				class="px-4 py-2 mx-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
			>
				Add User
			</button>

			<button
				type="button"
				class="px-4 py-2 mx-4 bg-gray-500 text-white rounded-md hover:bg-gray-600"
				@click="handleCancel"
			>
				Cancel
			</button>

		</div>

		<!-- Display form errors -->
		<div
			v-if="errors"
		>
			<ul>
				<li v-for="(error, field) in errors" :key="field">{{ error }}</li>
			</ul>
		</div>
	</form>
</template>