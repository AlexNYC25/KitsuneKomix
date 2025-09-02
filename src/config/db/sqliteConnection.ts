import { Database } from "@db/sqlite";
import { join } from "@std/path";

const DB_PATH = join(Deno.cwd(), "config", "database.sqlite");

let db: Database | null = null;

export function getDatabase(): Database {
  if (!db) {
    console.log("Connecting to database at:", DB_PATH);
    // This both creates a new database file if it does not exist and opens the existing one
    db = new Database(DB_PATH);
    console.log("Database connection established");
  }
  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    console.log("Database connection closed");
  }
}

export default getDatabase();
