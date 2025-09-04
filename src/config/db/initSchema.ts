import { getDatabase } from "./sqlite.ts";

import { dbLogger } from "../logger/loggers.ts";

const USERS = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    admin INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

const COMIC_LIBRARIES = `
  CREATE TABLE IF NOT EXISTS comic_libraries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    description TEXT,
    enabled INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

export function createTables() {
  try {
    dbLogger.info("Creating database tables...");
    const db = getDatabase();

    dbLogger.info("Executing USERS table SQL...");
    db.exec(USERS);
    dbLogger.info("USERS table created successfully");

    dbLogger.info("Executing COMIC_LIBRARIES table SQL...");
    db.exec(COMIC_LIBRARIES);
    dbLogger.info("COMIC_LIBRARIES table created successfully");

    dbLogger.info("All tables created successfully");
  } catch (error) {
    dbLogger.error("Failed to create tables: " + error);
    throw error;
  }
}
