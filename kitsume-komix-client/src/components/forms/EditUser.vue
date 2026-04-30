<script setup lang="ts">
	import { onMounted } from 'vue';

	import { useForm } from 'vee-validate';
	import Button from 'primevue/button';

	import { useUsersStore } from '@/stores/users';

	import { userInfoEditSchema } from '@/zod/users.schema';


	const props = defineProps<{
		onCancel?: () => void;
		userId: number;
	}>();

	const usersStore = useUsersStore();

	const { defineField, handleSubmit, errors, resetForm } = useForm({
		validationSchema: userInfoEditSchema,
		initialValues: {
			userEmail: '',
			userRole: 'user',
		}, 
	});
	
	const [editedUserEmail] = defineField('userEmail');
	const [editedUserRole] = defineField('userRole');

	onMounted(() => {
		editedUserEmail.value = usersStore.getUsers.find(user => user.id === props.userId)?.email || '';
		editedUserRole.value = usersStore.getUsers.find(user => user.id === props.userId)?.admin ? 'admin' : 'user';
	});

</script>

<template>
	<form
		class="lg:w-[520px] lg:h-[220px] flex flex-col fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 mb-6 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-white dark:bg-gray-900"
		@submit.prevent=""
	>
		<h3 class="text-lg font-semibold">Edit User</h3>

		<!-- User's Email -->
		<div>
			<label for="library-name-edit" class="block text-sm font-medium mb-1">New Email</label>
			<input
				id="library-name-edit"
				v-model="editedUserEmail"
				type="text"
				placeholder="e.g. user@example.com"
				class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
			/>
		</div>

		<!-- User's Role -->
		<div>
			<label for="user-role-edit" class="block text-sm font-medium mb-1">Role</label>
			<select
				id="user-role-edit"
				v-model="editedUserRole"
				class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
			>
				<option value="user">User</option>
				<option value="admin">Admin</option>
			</select>
		</div>

		<div class="flex items-center gap-2">
			<Button
				type="submit"
				label="Save User"
				severity="info"
			/>

			<Button
				type="button"
				label="Cancel"
				severity="info"
				@click="props.onCancel?.()"
			/>
		</div>
	</form>
</template>