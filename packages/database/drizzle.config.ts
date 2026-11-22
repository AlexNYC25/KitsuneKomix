import { defineConfig } from "drizzle-kit";

import { databaseUrl } from "kitsune-config";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/models",
  out: "./drizzle",
  dbCredentials: {
    url: databaseUrl,
  },
});
