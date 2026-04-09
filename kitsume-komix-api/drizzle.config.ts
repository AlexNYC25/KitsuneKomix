import { defineConfig } from "drizzle-kit";
import { join } from "node:path";
import process from "node:process";

const DB_PATH = join(process.cwd(), "config", "database.sqlite");
export default defineConfig({
  out: "./src/infrastructure/db/sqlite/drizzle",
  schema: "./src/infrastructure/db/sqlite/schemas/index.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: DB_PATH,
  },
});
