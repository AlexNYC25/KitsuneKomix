import { getDatabase } from "./sqlite.ts";

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
        console.log("Creating database tables...");
        const db = getDatabase();
        
        console.log("Executing USERS table SQL...");
        db.exec(USERS);
        console.log("USERS table created successfully");
        
        console.log("Executing COMIC_LIBRARIES table SQL...");
        db.exec(COMIC_LIBRARIES);
        console.log("COMIC_LIBRARIES table created successfully");
        
        console.log("All tables created successfully");
    } catch (error) {
        console.error("Failed to create tables:", error);
        throw error;
    }
}