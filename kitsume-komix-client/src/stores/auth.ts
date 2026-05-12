import { defineStore } from 'pinia'

import { useLibrariesStore } from '@/stores/libraries';
import type { PersistedAuth } from '@/types/index';
import { apiClient, setAuthToken, setRefreshToken } from '@/utilities/apiClient';
import { loadFromStorage, saveToStorage } from '@/utilities/storage';

const AUTH_STORAGE_KEY = 'kitsune_auth';

export const useAuthStore = defineStore('auth', {
	state: () => {
		const persisted = loadFromStorage<PersistedAuth | null>(AUTH_STORAGE_KEY, null);
		const state = {
			token: persisted?.token ?? null,
			refreshToken: persisted?.refreshToken ?? null,
			user: persisted?.user ?? null,
			loading: false,
			error: null as string | null,
			isAppSetup: null as boolean | null,
		};

		if (state.token) {
			setAuthToken(state.token);
		}
		if (state.refreshToken) {
			setRefreshToken(state.refreshToken);
		}

		return state;
	},
	getters: {
		isAuthenticated: (state) => !!state.token,
		needsSetup: (state) => state.isAppSetup === false
	},
	actions: {
		persist() {
			saveToStorage(AUTH_STORAGE_KEY, {
				token: this.token,
				refreshToken: this.refreshToken,
				user: this.user,
			});
			
			// Update the openapi-fetch client with the latest tokens
			setAuthToken(this.token);
			setRefreshToken(this.refreshToken);
		},
		async checkAppSetup(): Promise<boolean> {
			try {
				const { data, error } = await apiClient.GET('/auth/check-setup');
				
				if (error) {
					console.error('Error checking app setup:', error);
					this.isAppSetup = true;
					return true;
				}

				this.isAppSetup = data?.isSetup ?? true;
				return this.isAppSetup ?? true;
			} catch (error) {
				console.error('Error checking app setup:', error);
				this.isAppSetup = true;
				return true;
			}
		},
		async initialSetup({ email, password }: { email: string, password: string }): Promise<boolean> {
			this.loading = true;
			this.error = null;

			try {
				const { data, error } = await apiClient.POST('/users/create-user-setup', {
					body: {
						username: email,
						email,
						password
					}
				});

				if (error || !data) {
					throw new Error(error?.message || 'Initial setup failed');
				}

				// Mark app as setup
				this.isAppSetup = true;
				
				return true;
			} catch (error) {
				if (error instanceof Error) {
					this.error = error.message;
				} else {
					this.error = String(error);
				}
				return false;
			} finally {
				this.loading = false;
			}
		},
		async login({ username, password, rememberMe }: { username: string, password: string, rememberMe: boolean }): Promise<boolean> {
			this.loading = true;
			this.error = null;

			try {
				const { data, error } = await apiClient.POST('/auth/login', {
					body: {
						email: username,
						password: password
					}
				});

				if (error || !data) {
					throw new Error(error?.message || 'Login failed');
				}

				this.token = data.accessToken;
				this.refreshToken = data.refreshToken;
				this.user = { id: data.user.id, email: data.user.email, admin: data.user.admin };
				
				if (!rememberMe) {
					// If not remembering, clear tokens on unload
					window.addEventListener('beforeunload', () => {
						this.logout();
					});
				}
				
				this.persist();

				return true;
			} catch (error) {
				if (error instanceof Error) {
					this.error = error.message;
				} else {
					this.error = String(error);
				}
				this.persist();
				return false;
			} finally {
				this.loading = false;
			}
		},
		async postLoginActions() {
			try {
				const librariesStore = useLibrariesStore();
				await librariesStore.requestUsersLibraries();
				// Add other store calls here as needed
			} catch (error) {
				console.error('Failed to load libraries after login:', error);
			}
		},
		async refresh() {
			if (!this.refreshToken) {
				this.logout();
				return false;
			}

			this.loading = true;
			this.error = null;

			try {
				const { data, error } = await apiClient.POST('/auth/refresh-token', {
					body: {
						refreshToken: this.refreshToken
					}
				});

				if (error || !data) {
					throw new Error(error?.message || 'Token refresh failed');
				}

				this.token = data.accessToken;
				this.refreshToken = data.refreshToken;
				// Note: The API doesn't return user info on refresh, so we keep the existing user
				this.persist();
				
				return true;
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
			this.token = null;
			this.refreshToken = null;
			this.user = null;
			this.persist();
		}
	}
})