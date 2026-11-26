import { drizzle } from "drizzle-orm/better-sqlite3";

import { databaseUrl } from "kitsune-config";

import * as schema from "./schemas/index";

export type Database = ReturnType<typeof drizzle<typeof schema>>;

export const db = drizzle({
  connection: databaseUrl,
  schema,
});

export { schema };
