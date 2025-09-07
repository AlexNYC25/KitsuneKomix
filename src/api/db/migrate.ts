import { migrate } from "drizzle-orm/libsql/migrator";
import { join } from "@std/path";

import { dbLogger } from "../config/logger/loggers.ts";
import { createNewClient } from "./sqlite/client.ts";

export async function runMigrations() {
  dbLogger.info("Starting database migrations...");

  const { db, client } = createNewClient();

  if (!db || !client) {
    throw new Error("Database client is not initialized.");
  }

  // Ensure config directory exists
  const configDir = join(Deno.cwd(), "config");
  try {
    await Deno.stat(configDir);
  } catch {
    await Deno.mkdir(configDir, { recursive: true });
  }

  try {
    await migrate(db, { migrationsFolder: "./config/drizzle" });
    dbLogger.info("Migrations completed successfully!");
  } catch (error) {
    dbLogger.error(`Migration failed: ${error}`);
    throw error;
  } finally {
    client.close();
  }
}
