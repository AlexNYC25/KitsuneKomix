<script setup lang="ts">
	import { onMounted } from 'vue';

	import { useForm } from 'vee-validate';

	import { useUsersStore } from '@/stores/users';

	import { userInfoEditSchema } from '@/zod/users.schema';

	import FormModal from '@/components/ui/FormModal.vue';

	const props = defineProps<{
		onCancel?: () => void;
		userId: number;
	}>();

	const emit = defineEmits<{
		'update:modelValue': [value: boolean]
	}>()

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

	const handleCancel = (): void => {
		resetForm();
		emit('update:modelValue', false);
		props.onCancel?.();
	};

	const handleUpdateUser = handleSubmit(async (values) => {
		console.log('Form submitted with values:', values);
		await usersStore.updateExistingUser({
			id: props.userId,
			email: values.userEmail,
			admin: values.userRole === 'admin'
		});
		resetForm();
		emit('update:modelValue', false);
		props.onCancel?.();
	});

</script>

<template>
	<FormModal
		title="Edit User"
		sizeClass="lg:w-[520px] lg:h-[220px]"
		:modelValue="true"
		@update:modelValue="handleCancel"
	>
		<form @submit="handleUpdateUser">
			<!-- User's Email -->
			<div>
				<label for="new-user-email" class="block text-sm font-medium mb-1">Email</label>
				<input
					id="new-user-email"
					v-model="editedUserEmail"
					type="email"
					placeholder="e.g. user@example.com"
					class="w-full px-3 py-2 border rounded-md bg-surface-elevated border-surface-overlay"
				/>
			</div>

			<!-- User's Role -->
			<div>
				<label for="user-role-edit" class="block text-sm font-medium mb-1">Role</label>
				<select
					id="user-role-edit"
					v-model="editedUserRole"
					class="w-full px-3 py-2 border rounded-md bg-surface-elevated border-surface-overlay"
				>
					<option value="user">User</option>
					<option value="admin">Admin</option>
				</select>
			</div>

			<!-- Form's Buttons -->
			<div
				class="flex justify-center"
			>
				<button
					type="submit"
					class="px-4 py-2 mx-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
				>
					Update User
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