import { defineStore } from 'pinia'

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
    login({username, password}: {username: string, password: string}) {
      this.loading = true
      this.error = null
      // use the fetch api to call the backend on port 8000
			fetch('http://localhost:8000/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email: username, password })
			})
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok')
				}
				return response.json()
			})
			.then(data => {
				this.token = data.accessToken
				this.refreshToken = data.refreshToken
				this.user = { id: data.user.id, email: data.user.email, admin: data.user.admin }
			})
			.catch(error => {
				this.error = error.message
			})
			.finally(() => {
				this.loading = false
			})
    },
	refresh() {
		if (!this.refreshToken) {
			this.logout()
			return
		}
		this.loading = true
		this.error = null
		fetch('http://localhost:8000/api/auth/refresh-token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ refreshToken: this.refreshToken })
		})
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok')
			}
			return response.json()
		})
		.then(data => {
			this.token = data.accessToken
			this.refreshToken = data.refreshToken
			this.user = { id: data.user.id, email: data.user.email, admin: data.user.admin }
		})
		.catch(error => {
			this.error = error.message
			this.logout()
		})
		.finally(() => {
			this.loading = false
		})
	},
    logout() {
      this.token = null
    }
  }
})