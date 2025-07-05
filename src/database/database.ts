import { Database } from "@db/sqlite";
import { join } from "@std/path";
import logger from "../utilities/logger.ts";

// We prefer to use the config directory from the environment variable CONFIG_DIR but as a fallback we use the current working directory
const CONFIG_DIR = Deno.env.get("CONFIG_DIR") ?? join(Deno.cwd(), "config");
const DB_PATH = join(CONFIG_DIR, "database.db");


// Ensure config directory exists using Deno APIs
try {
  Deno.statSync(CONFIG_DIR);
} catch (err) {
  if (err instanceof Deno.errors.NotFound) {
    Deno.mkdirSync(CONFIG_DIR, { recursive: true });
  } else {
    const message = err instanceof Error ? err.message : String(err);
    logger.error('Database', `Error checking config directory: ${message}`);
    throw err;
  }
}

let isNewDb = false;
// Check if the database file exists
// If it does not exist, we will create a new one
try {
  Deno.statSync(DB_PATH);
} catch (err) {
  if (err instanceof Deno.errors.NotFound) {
    isNewDb = true;
  } else {
    throw err;
  }
}


// This both creates a new database file if it does not exist and opens the existing one
const db = new Database(DB_PATH);
// We want to log if we created a new database file or if we are using an existing one
if (isNewDb) {
  logger.info('SETUP', "New database file detected. Initializing schema...");
} else {
  logger.info('SETUP', "Existing database file found. Checking schema...");
}


export default db;