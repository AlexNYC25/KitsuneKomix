<script setup lang="ts">
	import { computed, ref, onMounted } from 'vue';
	import Button from 'primevue/button';

	import { useAuthStore } from '@/stores/auth';
	import { useUsersStore } from '@/stores/users';

	const authStore = useAuthStore();
	const usersStore = useUsersStore();

	import AddUser from '../forms/AddUser.vue';

	const users = computed(() => usersStore.getUsers);
	const isAdmin = computed(() => Boolean(authStore.user?.admin));

	const showAddUserForm = ref(false);
	const showEditUserForm = ref(false);
	const showResetPasswordForm = ref(false);
	const showEditUserLibrariesForm = ref(false);
	const showDeleteUserConfirmationForm = ref(false)

	const editedUserEmail = ref('')
	const editedUserPassword = ref('')
	const editedUserPasswordConfirmation = ref('')

	const handleAddUser = () => {
		showAddUserForm.value = true;
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
								@click="showEditUserForm = true"
							>
								<v-icon name="io-pencil-sharp" title="Edit User" scale="2" />
							</button>
						</div>

						<div>
							<button
								@click="showResetPasswordForm = true"
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
								@click="showDeleteUserConfirmationForm = true"
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
		<form
			v-if="showEditUserForm && isAdmin"
			class="lg:w-[520px] lg:h-[220px] flex flex-col fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 mb-6 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-white dark:bg-gray-900"
			@submit.prevent=""
		>
			<h3 class="text-lg font-semibold">Edit User</h3>

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
					@click="showEditUserForm = false"
				/>
			</div>
		</form>

		<!-- Change User Password Form -->
		<form
			v-if="showResetPasswordForm && isAdmin"
			class="lg:w-[520px] lg:h-[420px] flex flex-col fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 mb-6 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-white dark:bg-gray-900"
			@submit.prevent=""
		>
			<h3 class="text-lg font-semibold">Edit User's Password</h3>

			<div>
				<label for="library-name-edit" class="block text-sm font-medium mb-1">New Password</label>
				<input
					id="library-name-edit"
					v-model="editedUserPassword"
					type="password"
					placeholder="Enter new password"
					class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
				/>
			</div>

			<div>
				<label for="library-name-edit" class="block text-sm font-medium mb-1">Confirm New Password</label>
				<input
					id="library-name-edit"
					v-model="editedUserPasswordConfirmation"
					type="password"
					placeholder="Confirm new password"
					class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
				/>
			</div>

			<div class="flex items-center gap-2">
				<Button
					type="submit"
					label="Save Password"
					severity="info"
				/>

				<Button
					type="button"
					label="Cancel"
					severity="info"
					@click="showResetPasswordForm = false"
				/>
			</div>
		</form>
	</div>
</template>