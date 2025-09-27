import { defineConfig } from "drizzle-kit";
import { join } from "node:path";
import process from "node:process";

const DB_PATH = join(process.cwd(), "config", "database.sqlite");
export default defineConfig({
  out: "./drizzle",
  schema: "./db/sqlite/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: DB_PATH,
  },
});
