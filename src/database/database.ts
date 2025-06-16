import { Database } from "@db/sqlite";
import { join } from "@std/path";
import logger from "../utilities/logger.ts";

// Deno uses Deno.env.get for environment variables
const CONFIG_DIR = Deno.env.get("CONFIG_DIR") ?? join(Deno.cwd(), "config");
const DB_PATH = join(CONFIG_DIR, "database.db");


// Ensure config directory exists using Deno APIs
try {
  Deno.statSync(CONFIG_DIR);
} catch (err) {
  if (err instanceof Deno.errors.NotFound) {
    Deno.mkdirSync(CONFIG_DIR, { recursive: true });
  } else {
    throw err;
  }
}

let isNewDb = false;
try {
  Deno.statSync(DB_PATH);
} catch (err) {
  if (err instanceof Deno.errors.NotFound) {
    isNewDb = true;
  } else {
    throw err;
  }
}

const db = new Database(DB_PATH);

if (isNewDb) {
  logger.info('SETUP', "New database file detected. Initializing schema...");
} else {
  logger.info('SETUP', "Existing database file found. Checking schema...");
}



export default db;