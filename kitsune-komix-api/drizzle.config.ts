import { defineConfig } from "drizzle-kit";

import { env } from "#config/env.ts"

export default defineConfig({
  out: "../packages/database/src/drizzle",
  schema: "../packages/database/src/schemas/index.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: env.DB_PATH,
  },
});
