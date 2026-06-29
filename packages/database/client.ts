import { drizzle } from 'drizzle-orm/bun-sqlite';

import { env } from "./config/env.ts"
import { dbLogger } from "./loggers/index.ts";
import { generateSqlFilePath } from "./utilities/db-file.ts"

let db: ReturnType<typeof drizzle> | null = null;

// TODO: Handle edge case where macOS uses a proprietary build of sqlite that has additional hoops for extensions
// https://bun.com/docs/runtime/sqlite#loadextension

/**
 * Pulls up the global db connection if it already exists if not creates it
 * and saves it for future use
 * @returns Drizzle db
 */
export const getClient = async () => {
  if (!db) {
    const sqlitePath: string = await generateSqlFilePath(env.CONFIG_DIRECTORY);
    db = drizzle(sqlitePath, { casing: "snake_case" });

    db.$client.loadExtension('/honker/libhonker_ext.so')
    db.$client.prepare('SELECT honker_bootstrap()').run();

    dbLogger.info("SQLite client created")
  }
  return db;
};

/**
 * Checks if a connection to the SQLite database can be established using the provided configuration.
 * @returns a promise that resolves to true if the connection is successful, or false if it fails
 */
export const reconnect = async () => {
  const sqlitePath: string = await generateSqlFilePath(env.CONFIG_DIRECTORY);
  
  db = drizzle(sqlitePath, { casing: "snake_case" });
  dbLogger.info("SQLite client reconnected");
};

/**
 * Preforms a query to check if the sqlite client can 
 * @returns 
 */
export const testSQLiteConnection: () => Promise<boolean> = async () => {
  try {
    const db = await getClient();
    const result = db.$client.query("select 'Hello world' as message;").get();

    if (result.message) {
      return true;
    }

    return false;
  } catch (error) {
    dbLogger.error("SQLite connection test failed, attempting reconnect: " + error);
    reconnect();
    try {
      const db = await getClient();
      const result = db.$client.query("select 'Hello world' as message;").get();

      if (result.message) {
        return true;
      }

      return false;
    } catch (retryError) {
      dbLogger.error("SQLite reconnect failed: " + retryError);
      return false;
    }
  }
};