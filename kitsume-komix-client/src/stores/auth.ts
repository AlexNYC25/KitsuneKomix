import { defineStore } from 'pinia'

import { useLibrariesStore } from './libraries';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
		refreshToken: null as string | null,
    user: null as { id: number; email: string, admin: boolean } | null,
    loading: false,
    error: null as string | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token
  },
  actions: {
		async login({username, password}: {username: string, password: string}) {
			this.loading = true;
			this.error = null;
			try {
				const response = await fetch('http://localhost:8000/api/auth/login', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ email: username, password })
				});
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}

				const data = await response.json();
				this.token = data.accessToken;
				this.refreshToken = data.refreshToken;
				this.user = { id: data.user.id, email: data.user.email, admin: data.user.admin };

				const librariesStore = useLibrariesStore();
				await librariesStore.requestUsersLibraries();

				return true;
			} catch (error) {
				if (error instanceof Error){
					this.error = error.message
				} else {
					this.error = String(error)
				}
				return false;
			} finally {
				this.loading = false;
			}
		},
		async refresh() {
			if (!this.refreshToken) {
				this.logout()
				return
			}

			this.loading = true
			this.error = null

			try {
				const response = await fetch('http://localhost:8000/api/auth/refresh-token', {
					method: 'POST',
					headers: { 'content-Type': 'application/json'},
					body: JSON.stringify({ refreshToken: this.refreshToken })
				});

				if (!response.ok) {
					throw new Error('Network response was not ok');
				}

				const data = await response.json()

				this.token = data.accessToken
				this.refreshToken = data.refreshToken
				this.user = { id: data.user.id, email: data.user.email, admin: data.user.admin }
			} catch (error) {
				if (error instanceof Error) {
					this.error = error.message;
				} else {
					this.error = String(error);
				}
				this.logout();
				return false;
			} finally {
				this.loading = false;
			}
		},
		logout() {
			this.token = null
			this.refreshToken = null
			this.user = null
		},
		async apiFetch(input: RequestInfo, init: RequestInit = {}) {
			// ensure headers object exists
			if (!init.headers) {
				init.headers = {}
			}

			// add Authorization header if token exists
			if (this.token) {
				(init.headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`
			}

			let apiResponse = await fetch(input, init)

			// if we get a 401 response, try to refresh the token
			if (apiResponse.status === 401 && this.refreshToken) {
				const oldToken = this.token
				// use the refresh action to get a new token, should just set the new token in the store
				const refreshed = await this.refresh();

				// if the token changed, it means we got a new token, so we need to retry the original request
				if (refreshed && this.token !== oldToken) {
					(init.headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`
					apiResponse = await fetch(input, init)
				} else {
					// if the token didn't change, it means the refresh failed, so we logout
					this.logout()
				}
			}

			return apiResponse
		}
  }
})