import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { join } from "@std/path";

const DB_PATH = join(Deno.cwd(), "config", "database.sqlite");

let client: ReturnType<typeof createClient> | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export const getClient = () => {
  if (!client) {
    client = createClient({ url: `file:${DB_PATH}` });
    db = drizzle(client, { casing: "snake_case" });
  }
  return { client, db };
};

export const createNewClient = () => {
  const newClient = createClient({ url: `file:${DB_PATH}` });
  const newDb = drizzle(newClient, { casing: "snake_case" });
  return { client: newClient, db: newDb };
};

/**
 * Checks if a connection to the SQLite database can be established using the provided configuration.
 * @returns a promise that resolves to true if the connection is successful, or false if it fails
 */
export const testSQLiteConnection: () => Promise<boolean> = async () => {
  try {
    const { client } = getClient();
    await client.execute("SELECT 1");
    return true;
  } catch (error) {
    console.error("Error connecting to SQLite database:", error);
    return false;
  }
};