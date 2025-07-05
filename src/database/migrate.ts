import { Database } from "@db/sqlite";
import { join } from "@std/path";
import logger from "../utilities/logger.ts";

import { createMigrationsTable } from "../database/schemaDefinitions.ts";

export async function runMigrations(db: Database, migrationsDir = "./migrations") {
  // Ensure the migrations table exists so we can track applied migrations so we don't apply them again
  db.exec(createMigrationsTable);

  // Get list of already applied migrations
  logger.info('Migration:', "Checking for already applied migrations...");
  const applied = new Set<string>();
  const stmt = db.prepare("SELECT name FROM migrations");
  for (const { name } of stmt.all() as { name: string }[]) {
    applied.add(name);
  }
  stmt.finalize();

  // Read and sort .sql files in the migrations directory
  const migrationFiles: string[] = [];
  for await (const entry of Deno.readDir(migrationsDir)) {
    if (entry.isFile && entry.name.endsWith(".sql")) {
      migrationFiles.push(entry.name);
    }
  }
  migrationFiles.sort();

  // Run through each migration file
  for (const file of migrationFiles) {
    // Check if the migration has already been applied
    logger.info('Migration:', `Checking migration: ${file}`);
    if (!applied.has(file)) {
      logger.info('Migration:', `Applying migration: ${file}`);
      // Load and execute the migration SQL
      const sql = await Deno.readTextFile(join(migrationsDir, file));
      db.exec(sql);

      // Insert the migration record into the migrations table for tracking
      const insertStmt = db.prepare("INSERT INTO migrations (name) VALUES (?)");
      insertStmt.run(file);
      insertStmt.finalize();

      logger.info('Migration:', `Applied migration: ${file}`);
    }
  }

  logger.info('Migration:', "All migrations applied successfully, db is up to date.");
}