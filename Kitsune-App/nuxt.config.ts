// https://nuxt.com/docs/api/configuration/nuxt-config
import { z } from 'zod';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    dbFileName: z.string().default('database.sqlite'),
    betterAuthSecret: z.string().default('your_secret_key_here'),
    betterAuthUrl: z.string().default('http://localhost:3000'),
  }
})
