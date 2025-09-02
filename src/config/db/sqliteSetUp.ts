import { join } from "@std/path";
import { fileExistsSync } from "../../utilities/file.ts";
import { createTables } from "./sqliteInitializeSchema.ts";
import { getDatabase } from "./sqliteConnection.ts";

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
    console.log("=== Starting database initialization ===");

    const configDir = join(Deno.cwd(), "config");
    const dbPath = join(configDir, "database.sqlite");

    if (!fileExistsSync(configDir)) {
      console.log("Config directory does not exist, creating it...");
      Deno.mkdirSync(configDir, { recursive: true });
      console.log("Config directory created successfully");
    } else {
      console.log("Config directory already exists");
    }

    // Check if database file exists
    const dbFileExists = fileExistsSync(dbPath);
    console.log("Database file exists:", dbFileExists);

    // Check if tables exist by trying to query one of them
    const tablesExist = dbTablesExist();

    if (!tablesExist) {
      console.log("Database needs initialization, creating tables...");
      createTables(); // This will create the connection and the file if needed
      console.log("Database initialized with schema successfully");
    } else {
      console.log(
        "Database file and tables already exist, skipping initialization",
      );
    }

    console.log("=== Database initialization completed ===");
  } catch (error) {
    console.error("=== Database initialization failed ===");
    console.error("Error:", error);
    throw error;
  }
}
