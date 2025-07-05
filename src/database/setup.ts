import { join } from "@std/path";

import db from "./database.ts";
import { initializeSchema } from "./initSchema.ts";
import { runMigrations } from "./migrate.ts";

/**
 * Sets up the database by initializing the schema and running migrations.
 * This function should be called once to ensure the database is ready for use.
 * The main runner that calls the maintenance functions for starting up the database.
 */
export const setUpDatabase = () => {
  // This function can be used to set up the database
  // It currently initializes the schema and runs migrations
  initializeSchema(db);
  runMigrations(db, join(Deno.cwd(), "migrations"));
}