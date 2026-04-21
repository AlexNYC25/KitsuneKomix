import { defineStore } from 'pinia'

import { apiClient } from '../utilities/apiClient'
import type { User } from '@/types/users.types'

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
		}
	}
});