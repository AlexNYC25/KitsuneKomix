import 'dotenv/config'
import { defineConfig } from 'drizzle-kit';

const fileURL = process.env.NUXT_DB_FILE_NAME || 'database.sqlite'

export default defineConfig({
  out: './drizzle',
  schema: './shared/database/tables/schemas.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: fileURL,
  },
});