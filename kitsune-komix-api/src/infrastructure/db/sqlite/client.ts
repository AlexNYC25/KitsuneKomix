import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

import { dbLogger } from "#logger/loggers.ts";

import { env } from "#config/env.ts"

let client: ReturnType<typeof createClient> | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export const getClient = () => {
  if (!client) {
    client = createClient({ url: `file:${env.DB_PATH}` });
    db = drizzle(client, { casing: "snake_case" });
  }
  return { client, db };
};

export const createNewClient = () => {
  const newClient = createClient({ url: `file:${env.DB_PATH}` });
  const newDb = drizzle(newClient, { casing: "snake_case" });
  return { client: newClient, db: newDb };
};

/**
 * Checks if a connection to the SQLite database can be established using the provided configuration.
 * @returns a promise that resolves to true if the connection is successful, or false if it fails
 */
export const reconnect = () => {
  client?.close();
  client = createClient({ url: `file:${env.DB_PATH}` });
  db = drizzle(client, { casing: "snake_case" });
  dbLogger.info("SQLite client reconnected");
};

export const testSQLiteConnection: () => Promise<boolean> = async () => {
  try {
    const { client } = getClient();
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