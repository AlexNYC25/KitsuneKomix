import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { join } from "node:path";
import { stat, mkdir } from "node:fs/promises";

import { dbLogger } from "../loggers/index.ts";
import { getClient } from "../drizzle/client.ts";
import { env } from "../config/env.ts";

export async function runMigrations() {
  dbLogger.info("Starting database migrations...");

  const db = await getClient();

  if (!db) {
    throw new Error("Database client is not initialized.");
  }

  try {
    await mkdir(env.CONFIG_DIRECTORY, { recursive: true });
  } catch (error) {
    // directory already exists
    dbLogger.error("There wan error making the config directory")
  }

  const migrationsPath = join(import.meta.dirname!, "..", "drizzle_migrations");
  dbLogger.info(`Looking for migrations in: ${migrationsPath}`);

  try {
    await stat(migrationsPath);
    dbLogger.info("Migrations directory found");
  } catch {
    throw new Error(`Migrations directory not found at: ${migrationsPath}`);
  }

  try {
    migrate(db, { migrationsFolder: migrationsPath });
    dbLogger.info("Migrations completed successfully!");
  } catch (error) {
    dbLogger.error(`Migration failed: ${error}`);
    throw error;
  }
}