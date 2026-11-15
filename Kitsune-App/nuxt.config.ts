// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },
	runtimeConfig: {
		dbFileName: "database.sqlite",
		betterAuthSecret: "your_secret_key_here",
		betterAuthUrl: "http://localhost:3000",
	},
});
