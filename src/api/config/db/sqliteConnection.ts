import { Database } from "@db/sqlite";
import { join } from "@std/path";

import { dbLogger } from "../logger/loggers.ts";

const DB_PATH = join(Deno.cwd(), "config", "database.sqlite");

let db: Database | null = null;

export function getDatabase(): Database {
  if (!db) {
    dbLogger.info("Connecting to database at: " + DB_PATH);
    // This both creates a new database file if it does not exist and opens the existing one
    db = new Database(DB_PATH);
    dbLogger.info("Database connection established");
  }
  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    dbLogger.info("Database connection closed");
  }
}

export default getDatabase();
