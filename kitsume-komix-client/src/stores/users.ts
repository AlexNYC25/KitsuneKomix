import { defineStore } from 'pinia'

import { apiClient } from '../utilities/apiClient'
import type { User, UserRegistractionPayload, UserEditPayload } from '@/types/users.types'

export const useUsersStore = defineStore('users', {
	state: () => ({
		users: [] as User[]
	}),
	getters: {
		getUsers: (state) => state.users
	},
	actions: {
		setUsers(users: User[]) {
			this.users = users;
		},
		async requestUsers() {
			const { data, error } = await apiClient.GET('/users');

			if (error) {
				console.error('Error fetching users:', error);
				return;
			}
			this.setUsers(data.users);
		},
		async registerNewUser(newUser: UserRegistractionPayload) {
			const { data, error } = await apiClient.POST('/users/create-user', {
				body: {
					email: newUser.email,
					password: newUser.password,
					admin: newUser.admin
				}
			});

			if (error) {
				console.error('Error registering new user:', error);
				return; // Todo: now  show error message
			} 

			if (!error) {
				
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
				console.error('Error updating user:', error);
				return;
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
				console.error('Error deleting user:', error);
				return;
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