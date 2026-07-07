import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { join } from "node:path";
import { stat, mkdir } from "node:fs/promises"

import { dbLogger } from "../loggers/index.ts";
import { getClient } from "../drizzle/client.ts";

export async function runMigrations() {
  dbLogger.info("Starting database migrations...");

  const db = await getClient();

  if (!db) {
    throw new Error("Database client is not initialized.");
  }

  // Ensure config directory exists
  const configDir = join(process.cwd(), "config");
  try {
    await stat(configDir);
  } catch {
    await mkdir(configDir, { recursive: true });
  }

  try {
    const migrationsPath = join(import.meta.dirname!, "..", "drizzle");
    dbLogger.info(`Looking for migrations in: ${migrationsPath}`);

    // Check if migrations directory exists
    try {
      await stat(migrationsPath);
      dbLogger.info("Migrations directory found");
    } catch {
      throw new Error(`Migrations directory not found at: ${migrationsPath}`);
    }

    migrate(db, { migrationsFolder: migrationsPath });
    dbLogger.info("Migrations completed successfully!");
  } catch (error) {
    dbLogger.error(`Migration failed: ${error}`);
    throw error;
  } finally {
    db.$client.close();
  }
}
