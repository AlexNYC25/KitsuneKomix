import { Database } from "@db/sqlite";
import { join } from "@std/path";
import logger from "../utilities/logger.ts";

import { createMigrationsTable } from "../database/schemaDefinitions.ts";

export async function runMigrations(db: Database, migrationsDir = "./migrations") {
  // Ensure the migrations table exists
  db.exec(createMigrationsTable);

  // Get applied migrations
  const applied = new Set<string>();
  const stmt = db.prepare("SELECT name FROM migrations");
  for (const { name } of stmt.all() as { name: string }[]) {
    applied.add(name);
  }
  stmt.finalize();

  // Read and sort migration files
  const migrationFiles: string[] = [];
  for await (const entry of Deno.readDir(migrationsDir)) {
    if (entry.isFile && entry.name.endsWith(".sql")) {
      migrationFiles.push(entry.name);
    }
  }
  migrationFiles.sort();

  // Apply new migrations
  for (const file of migrationFiles) {
    if (!applied.has(file)) {
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

  logger.info('Migration:', "All migrations applied successfully.");
}