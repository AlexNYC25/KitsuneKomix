import { defineConfig } from "drizzle-kit";

const configDir = process.env.CONFIG_DIRECTORY ?? "/app/data/config";
const dbFileName = process.env.DB_FILE_NAME ?? "database.sqlite";

export default defineConfig({
  out: "./drizzle_migrations",
  schema: "./schemas/index.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: `${configDir}/${dbFileName}`,
  },
});