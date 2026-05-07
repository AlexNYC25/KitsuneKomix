import { z } from 'zod'

export const envSchema = z.object({
  API_URL: z.url().default('http://localhost:8001')
})

