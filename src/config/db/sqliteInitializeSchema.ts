import { getDatabase } from "./sqliteConnection.ts";

import { dbLogger } from "../logger/loggers.ts";

const USERS = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    password_hash TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    admin INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

const APP_SETTINGS = `
  CREATE TABLE IF NOT EXISTS app_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    admin_only INTEGER NOT NULL DEFAULT 0,
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
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

//TODO: Expand into mapping tables for authors, series, publishers, tags, etc.
const COMIC_BOOKS = `
  CREATE TABLE IF NOT EXISTS comic_books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    library_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    title TEXT,
    series TEXT,
    issue_number TEXT,
    volume TEXT,
    authors TEXT,
    publisher TEXT,
    publication_date TEXT,
    tags TEXT,
    read INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (library_id) REFERENCES comic_libraries(id) ON DELETE CASCADE
  );
`;

const COMIC_SERIES = `
  CREATE TABLE IF NOT EXISTS comic_series (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    folder_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

export function createTables() {
  try {
    dbLogger.info("Creating database tables...");
    const db = getDatabase();

    dbLogger.info("Executing APP_SETTINGS table SQL...");
    db.exec(APP_SETTINGS);
    dbLogger.info("APP_SETTINGS table created successfully");

    dbLogger.info("Executing USERS table SQL...");
    db.exec(USERS);
    dbLogger.info("USERS table created successfully");

    dbLogger.info("Executing COMIC_LIBRARIES table SQL...");
    db.exec(COMIC_LIBRARIES);
    dbLogger.info("COMIC_LIBRARIES table created successfully");

    dbLogger.info("Executing COMIC_BOOKS table SQL...");
    db.exec(COMIC_BOOKS);
    dbLogger.info("COMIC_BOOKS table created successfully");

    dbLogger.info("Executing COMIC_SERIES table SQL...");
    db.exec(COMIC_SERIES);
    dbLogger.info("COMIC_SERIES table created successfully");

    dbLogger.info("All tables created successfully");
  } catch (error) {
    dbLogger.error("Failed to create tables: " + error);
    throw error;
  }
}
