import { Database } from "@db/sqlite";
import { existsSync, ensureDirSync } from "@std/fs";
import { join } from "@std/path";

import logger from "../utilities/logger.ts";
import { initializeSchema } from "./initSchema.ts";

// Deno uses Deno.env.get for environment variables
const CONFIG_DIR = Deno.env.get("CONFIG_DIR") ?? join(Deno.cwd(), "config");
const DB_PATH = join(CONFIG_DIR, "database.db");

console.log(`Database path: ${DB_PATH}`);

// Ensure config directory exists
if (!existsSync(CONFIG_DIR)) {
  ensureDirSync(CONFIG_DIR);
}

const isNewDb = !existsSync(DB_PATH);
const db = new Database(DB_PATH);

if (isNewDb) {
  logger.info('SETUP', "New database file detected. Initializing schema...");
} else {
  logger.info('SETUP', "Existing database file found. Checking schema...");
}

initializeSchema(db);

export default db;