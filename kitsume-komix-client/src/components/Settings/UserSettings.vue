<script setup lang="ts">
	import { computed, ref, onMounted } from 'vue';
	import Button from 'primevue/button';

	import { useAuthStore } from '@/stores/auth';
	import { useUsersStore } from '@/stores/users';

	const authStore = useAuthStore();
	const usersStore = useUsersStore();

	import AddUser from '../forms/AddUser.vue';
	import EditUser from '../forms/EditUser.vue';
	import EditPassword from '../forms/EditPassword.vue';
	import DeleteUser from '../forms/DeleteUser.vue';

	const users = computed(() => usersStore.getUsers);
	const isAdmin = computed(() => Boolean(authStore.user?.admin));

	const showAddUserForm = ref(false);
	const showEditUserForm = ref(false);
	const showResetPasswordForm = ref(false);
	const showEditUserLibrariesForm = ref(false);
	const showDeleteUserConfirmationForm = ref(false)
	const selectedUserIdForEdit = ref<number | null>(null);
	const selectedUserIdForPasswordEdit = ref<number | null>(null);
	const selectedUserIdForDelete = ref<number | null>(null);

	const handleAddUser = () => {
		showAddUserForm.value = true;
	};

	const handleOpenEditUserForm = (userId: number) => {
		selectedUserIdForEdit.value = userId;
		showEditUserForm.value = true;
	};

	const handleCloseEditUserForm = () => {
		showEditUserForm.value = false;
		selectedUserIdForEdit.value = null;
	};

	const handleOpenEditPasswordForm = (userId: number) => {
		selectedUserIdForPasswordEdit.value = userId;
		showResetPasswordForm.value = true;
	};

	const handleCloseEditPasswordForm = () => {
		showResetPasswordForm.value = false;
		selectedUserIdForPasswordEdit.value = null;
	};

	const handleOpenDeleteUserConfirmationForm = (userId: number) => {
		selectedUserIdForDelete.value = userId;
		showDeleteUserConfirmationForm.value = true;
	};

	const handleCloseDeleteUserConfirmationForm = () => {
		showDeleteUserConfirmationForm.value = false;
		selectedUserIdForDelete.value = null;
	};

	onMounted(async () => {
		if (usersStore.getUsers.length === 0 && isAdmin.value) {
			try {
				await usersStore.requestUsers();
			} catch (error) {
				console.error('Failed to load users for settings page:', error);
			}
		}
	});
</script>

<template>
	<div v-if="isAdmin" id="libraries-section" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-12">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-2xl font-semibold">Users</h2>

			<Button
				v-if="isAdmin"
				label="Add User"
				icon="pi pi-plus"
				severity="info"
				@click="handleAddUser"
			/>
		</div>

		<!-- Users List -->
		<div v-if="users.length === 0" class="text-gray-600 dark:text-gray-400">
			<p>No users found.</p>
		</div>

		<div 
			v-else
			class="flex flex-col gap-4 w-full"
		>
			<div
				v-for="user in users"
				:key="user.id"
				class="border rounded-lg p-8 w-full"
			>
				<div
					class="flex"
				>
					<div
						class="grow-2"
					>
						<v-icon name="io-person" :fill="user.admin ? 'red' : 'blue'" :title="user.admin ? 'Admin' : 'User'" scale="2" />
					</div>
					
					<div
						class="grow-8 flex items-center"
					>
						{{ user.email }}
					</div>
					
					<div
						class="grow-2 flex"
					>
						<div>
							<button
								@click="handleOpenEditUserForm(user.id)"
							>
								<v-icon name="io-pencil-sharp" title="Edit User" scale="2" />
							</button>
						</div>

						<div>
							<button
								@click="handleOpenEditPasswordForm(user.id)"
							>
								<v-icon name="io-lock-closed" title="Edit Password" scale="2" />
							</button>
						</div>

						<div>
							<button
								@click="showEditUserLibrariesForm = true"
							>
								<v-icon name="md-list-round" title="Add Library" scale="2" />
							</button>
						</div>

						<div>
							<button
								@click="handleOpenDeleteUserConfirmationForm(user.id)"
							>
								<v-icon name="io-trash" title="Delete User" scale="2" />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Add User Form -->
		<AddUser v-if="showAddUserForm && isAdmin" @cancel="showAddUserForm = false" />

		<!-- Edit User Form -->
		<EditUser
			v-if="showEditUserForm && isAdmin && selectedUserIdForEdit !== null"
			:user-id="selectedUserIdForEdit"
			:on-cancel="handleCloseEditUserForm"
		/>

		<!-- Change User Password Form -->
		<EditPassword
			v-if="showResetPasswordForm && isAdmin && selectedUserIdForPasswordEdit !== null"
			:user-id="selectedUserIdForPasswordEdit"
			:on-cancel="handleCloseEditPasswordForm"
		/>

		<!-- Delete User Confirmation -->
		<DeleteUser
			v-if="showDeleteUserConfirmationForm && isAdmin && selectedUserIdForDelete !== null"
			:user-id="selectedUserIdForDelete"
			:on-cancel="handleCloseDeleteUserConfirmationForm"
		/>
	</div>
</template>