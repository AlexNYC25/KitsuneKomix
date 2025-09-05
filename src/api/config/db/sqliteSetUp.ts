import { join } from "@std/path";
import { fileExistsSync } from "../../utilities/file.ts";
import { createTables } from "./sqliteInitializeSchema.ts";
import { seedData } from "./seedData.ts";
import { getDatabase } from "./sqliteConnection.ts";
import { dbLogger } from "../logger/loggers.ts";

function dbTablesExist(): boolean {
  try {
    const db = getDatabase();
    const result = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='comic_libraries'",
    ).get();
    return result !== undefined;
  } catch {
    return false;
  }
}

export function initializeDatabase() {
  try {
    dbLogger.info("=== Starting database initialization ===");

    const configDir = join(Deno.cwd(), "config");
    const dbPath = join(configDir, "database.sqlite");

    if (!fileExistsSync(configDir)) {
      dbLogger.info("Config directory does not exist, creating it...");
      Deno.mkdirSync(configDir, { recursive: true });
      dbLogger.info("Config directory created successfully");
    } else {
      dbLogger.info("Config directory already exists");
    }

    // Check if database file exists
    const dbFileExists = fileExistsSync(dbPath);
    dbLogger.info("Database file exists: " + dbFileExists);

    // Check if tables exist by trying to query one of them
    const tablesExist = dbTablesExist();

    if (!tablesExist) {
      dbLogger.info("Database needs initialization, creating tables...");
      createTables(); // This will create the connection and the file if needed
      seedData(); // Seed initial data if necessary
      dbLogger.info("Database initialized with schema successfully");
    } else {
      dbLogger.info(
        "Database file and tables already exist, skipping initialization",
      );
    }

    dbLogger.info("=== Database initialization completed ===");
  } catch (error) {
    dbLogger.error("=== Database initialization failed ===");
    dbLogger.error("Error: " + error);
    throw error;
  }
}
