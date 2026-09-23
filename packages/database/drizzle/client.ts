import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from "bun:sqlite";

import { env } from "../config/env.ts"
import { dbLogger } from "../loggers/index.ts";
import { generateSqlFilePath } from "../utilities/db-file.ts"

import type { DrizzleType } from "../shared/types/index.ts";

let db: DrizzleType | null = null;

// TODO: Handle edge case where macOS uses a proprietary build of sqlite that has additional hoops for extensions
// https://bun.com/docs/runtime/sqlite#loadextension

/**
 * Single source of truth for the SQLite connection settings applied to every
 * connection opened by this package. WAL mode allows readers and a single
 * writer to operate concurrently across the API, watcher and worker
 * processes, and busy_timeout makes writes wait instead of failing with
 * SQLITE_BUSY when another process holds the lock.
 */
export const CONNECTION_PRAGMAS = (busyTimeout: number): string => `
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA busy_timeout = ${busyTimeout};
  PRAGMA foreign_keys = ON;
`;

const openDatabase = (sqlitePath: string): Database => {
  const sqlite = new Database(sqlitePath, { create: true, readwrite: true });

  sqlite.exec(CONNECTION_PRAGMAS(env.SQLITE_BUSY_TIMEOUT));

  return sqlite;
};

/**
 * Pulls up the global db connection if it already exists if not creates it
 * and saves it for future use
 * @returns Drizzle db
 */
export const getClient = async () => {
  if (!db) {
    const sqlitePath: string = await generateSqlFilePath(env.CONFIG_DIRECTORY);
    db = drizzle({ client: openDatabase(sqlitePath) });

    dbLogger.info("SQLite client created")
  }

  return db;
};

/**
 * Closes the existing connection (if any) and opens a fresh one with the
 * configured pragmas.
 * @returns the newly created Drizzle db
 */
export const reconnect = async (): Promise<DrizzleType> => {
  if (db) {
    db.$client.close();
  }

  const sqlitePath: string = await generateSqlFilePath(env.CONFIG_DIRECTORY);
  
  db = drizzle({ client: openDatabase(sqlitePath) });
  dbLogger.info("SQLite client reconnected");

  return db;
};

/**
 * Preforms a query to check if the sqlite client can 
 * @returns 
 */
export const testSQLiteConnection: () => Promise<boolean> = async () => {
  try {
    const db: DrizzleType | null = await getClient();
    const result: {message: string} = db.$client.query("select 'Hello world' as message;").get() as {message: string};

    if (result?.message) {
      return true;
    }

    return false;
  } catch (error) {
    dbLogger.error("SQLite connection test failed, attempting reconnect: " + error);

    try {
      const db: DrizzleType = await reconnect();
      const result: {message: string} = db.$client.query("select 'Hello world' as message;").get() as {message: string};

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