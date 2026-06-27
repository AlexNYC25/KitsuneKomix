import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client"

import { env } from "./config/env.ts"
import { dbLogger } from "./loggers/index.ts";
import { generateSqlFilePath } from "./utilities/db-file.ts"
import { installHonkerExtension } from "./setup/install-honker.ts";

let client: ReturnType<typeof createClient> | null = null;
let db: ReturnType<typeof drizzle> | null = null;
let honkerInstalled: boolean = false; 

/**
 * Pulls up the global client and db connection if it already exists if not creates them
 * and saves it for future use
 * @returns client and db objects
 */
export const getClient = async () => {
  if (!client) {
    const sqlitePath = generateSqlFilePath(env.CONFIG_DIRECTORY);
    client = createClient({ url: `file:${sqlitePath}` });
    db = drizzle(client, { casing: "snake_case" });
    dbLogger.info("SQLite client created")

    if (!honkerInstalled) {
      try {
        await installHonkerExtension();
      } catch (error) {
        throw error;
      }
      
      honkerInstalled = true;
    }
  }
  return { client, db };
};

/**
 * Checks if a connection to the SQLite database can be established using the provided configuration.
 * @returns a promise that resolves to true if the connection is successful, or false if it fails
 */
export const reconnect = () => {
  const sqlitePath = generateSqlFilePath(env.CONFIG_DIRECTORY);
  client?.close();
  client = createClient({ url: `file:${sqlitePath}` });
  db = drizzle(client, { casing: "snake_case" });
  dbLogger.info("SQLite client reconnected");
};

/**
 * Preforms a query to check if the sqlite client can 
 * @returns 
 */
export const testSQLiteConnection: () => Promise<boolean> = async () => {
  try {
    const { client } = await getClient();
    await client.execute("SELECT 1");
    return true;
  } catch (error) {
    dbLogger.error("SQLite connection test failed, attempting reconnect: " + error);
    reconnect();
    try {
      await client!.execute("SELECT 1");
      return true;
    } catch (retryError) {
      dbLogger.error("SQLite reconnect failed: " + retryError);
      return false;
    }
  }
};