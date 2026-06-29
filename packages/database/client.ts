import { drizzle } from 'drizzle-orm/better-sqlite3';

import { env } from "./config/env.ts"
import { dbLogger } from "./loggers/index.ts";
import { generateSqlFilePath } from "./utilities/db-file.ts"
import { installHonkerExtension } from "./setup/install-honker.ts";

let db: ReturnType<typeof drizzle> | null = null;
let honkerInstalled: boolean = false; 

/**
 * Pulls up the global db connection if it already exists if not creates it
 * and saves it for future use
 * @returns Drizzle db
 */
export const getClient = async () => {
  if (!db) {
    const sqlitePath: string = await generateSqlFilePath(env.CONFIG_DIRECTORY);
    db = drizzle(sqlitePath, { casing: "snake_case" });

    dbLogger.info("SQLite client created")

    if (!honkerInstalled) {
      try {
        installHonkerExtension(db.$client);
      } catch (error) {
        throw error;
      }
      
      honkerInstalled = true;
    }
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
    const results = db.all("SELECT 1");

    if (results.length > 1) {
      return true;
    }

    return false;
  } catch (error) {
    dbLogger.error("SQLite connection test failed, attempting reconnect: " + error);
    reconnect();
    try {
      const db = await getClient();
      const results = db.all("SELECT 1");

      if (results.length > 1) {
        return true;
      }

      return false;
    } catch (retryError) {
      dbLogger.error("SQLite reconnect failed: " + retryError);
      return false;
    }
  }
};