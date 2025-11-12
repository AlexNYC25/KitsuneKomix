import { defineStore } from 'pinia'

import { loadFromStorage, saveToStorage } from '../utilities/storage';
import { apiClient, setAuthToken, setRefreshToken, setTokenRefreshCallback } from '../utilities/apiClient';
import { useLibrariesStore } from './libraries';
import type { PersistedAuth } from '../interfaces/auth.interfaces';

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
		};

		if (state.token) {
			setAuthToken(state.token);
		}
		if (state.refreshToken) {
			setRefreshToken(state.refreshToken);
		}

		// TODO: Refactor to avoid circular dependency, update docs
		if (state.token && state.user) {
			// Trigger post-login actions if user data exists
			setTimeout(async () => {
				const authStore = useAuthStore();
				setTokenRefreshCallback(() => authStore.refresh());
					await authStore.postLoginActions();
			}, 0);
		}

		return state;
	},
	getters: {
		isAuthenticated: (state) => !!state.token
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
		async login({ username, password }: { username: string, password: string }) {
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
				
				this.persist();

				// Set up the token refresh callback after successful login
				setTokenRefreshCallback(() => this.refresh());

				await this.postLoginActions();

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
			const librariesStore = useLibrariesStore();
			await librariesStore.requestUsersLibraries();
			// Add other store calls here as needed
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