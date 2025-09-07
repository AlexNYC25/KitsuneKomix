import { defineConfig } from 'drizzle-kit';
import { join } from "node:path";
import process from "node:process";

const DB_PATH = join(process.cwd(), "config", "database.app.sqlite");
export default defineConfig({
  out: './config/drizzle',
  schema: './src/api/db/sqlite/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: DB_PATH,
  },
});