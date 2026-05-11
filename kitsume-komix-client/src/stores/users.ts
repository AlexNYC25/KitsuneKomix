import { defineStore } from 'pinia'

import { apiClient } from '@/utilities/apiClient'
import type { User, UserRegistrationPayload, UserEditPayload } from '@/types/users.types'

export const useUsersStore = defineStore('users', {
	state: () => ({
		users: [] as User[]
	}),
	actions: {
		setUsers(users: User[]) {
			this.users = users;
		},
		async requestUsers() {
			const { data, error } = await apiClient.GET('/users');

			if (error) {
				throw new Error(error?.message || 'Failed to fetch users');
			}
			this.setUsers(data.users);
		},
		async registerNewUser(newUser: UserRegistrationPayload) {
			const { data, error } = await apiClient.POST('/users/create-user', {
				body: {
					email: newUser.email,
					password: newUser.password,
					admin: newUser.admin
				}
			});

			if (error) {
				throw new Error(error?.message || 'Failed to register user');
			}

			if(data && data.userId) {
				this.requestUsers();
			}
		},
		async updateExistingUser(updatedUser: UserEditPayload) {
			const { data, error } = await apiClient.POST(`/users/edit-user`, {
				body: {
					id: updatedUser.id,
					email: updatedUser.email,
					admin: updatedUser.admin,
					password: updatedUser.password ? updatedUser.password : undefined
				}
			});

			if (error) {
				throw new Error(error?.message || 'Failed to update user');
			}

			if(data && data.success) {
				this.requestUsers();
			}
		},
		async deleteUser(userId: number) {
			const { data, error } = await apiClient.DELETE('/users/delete-user/{id}', {
				params: {
					path: {
						id: String(userId)
					}
				},
			});

			if (error) {
				throw new Error(error?.message || 'Failed to delete user');
			}

			if(data && data.success) {
				this.requestUsers();
			}
		},
		reset() {
			this.users = [];
		}
	}
});