<script setup lang="ts">
	import { computed, ref, onMounted } from 'vue';
	import Button from 'primevue/button';

	import { useAuthStore } from '@/stores/auth';
	import { useUsersStore } from '@/stores/users';

	const authStore = useAuthStore();
	const usersStore = useUsersStore();

	const users = computed(() => usersStore.getUsers);
	const isAdmin = computed(() => Boolean(authStore.user?.admin));

	const handleAddUser = () => {
		// Logic to handle adding a user
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
							<button>
								<v-icon name="io-pencil-sharp" title="Edit User" scale="2" />
							</button>
						</div>

						<div>
							<button>
								<v-icon name="io-lock-closed" title="Edit Password" scale="2" />
							</button>
						</div>

						<div>
							<button>
								<v-icon name="io-add-circle" title="Add Library" scale="2" />
							</button>
						</div>

						<div>
							<button>
								<v-icon name="io-trash" title="Delete User" scale="2" />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>