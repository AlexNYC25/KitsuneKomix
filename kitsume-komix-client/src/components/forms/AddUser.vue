<script setup lang="ts">
	import { useForm } from 'vee-validate';

	import FormModal from '@/components/ui/FormModal.vue';
	import { useUsersStore } from '@/stores/users';
	import { userSignUpSchema }	from '@/zod/users.schema';


	const props = defineProps<{
		onCancel?: () => void;
	}>();

	const emit = defineEmits<{
		'update:modelValue': [value: boolean]
	}>()

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
		emit('update:modelValue', false);
		props.onCancel?.();
	};

	const handleAddUser = handleSubmit(async (values) => {
		try {
			await usersStore.registerNewUser({
				username: values.userEmail, // Using email as username for simplicity
				email: values.userEmail,
				password: values.userPassword,
				admin: values.userRole === "admin"
			});
			resetForm();
			emit('update:modelValue', false);
			props.onCancel?.();
		} catch (error) {
			console.error('Failed to register user:', error);
		}
	});


</script>

<template>
	<FormModal
		title="Add User"
		sizeClass="lg:w-lg lg:h-lg"
		:modelValue="true"
		@update:modelValue="handleCancel"
	>
		<form @submit="handleAddUser">
			<!-- New User's Email -->
			<div>
				<label for="new-user-email" class="block text-sm font-medium mb-1">Email</label>
				<input
					id="new-user-email"
					v-model="newUserEmail"
					type="email"
					placeholder="e.g. user@example.com"
					class="w-full px-3 py-2 border rounded-md bg-surface-elevated border-surface-overlay"
				/>
			</div>

			<!-- New User's Role i.e. admin or not -->
			<div>
				<label for="new-user-role" class="block text-sm font-medium mb-1">Role</label>
				<select
					id="new-user-role"
					v-model="newUserRole"
					class="w-full px-3 py-2 border rounded-md bg-surface-elevated border-surface-overlay"
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
					class="w-full px-3 py-2 border rounded-md bg-surface-elevated border-surface-overlay"
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
					class="px-4 py-2 mx-4 bg-surface-overlay hover:bg-surface-elevated text-text-primary rounded-md"
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
	</FormModal>
</template>