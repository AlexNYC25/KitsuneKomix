import { join } from "@std/path";

import db from "./database.ts";
import { initializeSchema } from "./initSchema.ts";
import { runMigrations } from "./migrate.ts";

export const setUpDatabase = () => {
  // This function can be used to set up the database
  // It currently initializes the schema and runs migrations
  initializeSchema(db);
  runMigrations(db, join(Deno.cwd(), "migrations"));
}