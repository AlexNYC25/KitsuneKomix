import { defineConfig } from "drizzle-kit";

import { env } from "#config/env.ts"

export default defineConfig({
  out: "./src/infrastructure/db/sqlite/drizzle",
  schema: "./src/infrastructure/db/sqlite/schemas/index.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: env.DB_PATH,
  },
});
