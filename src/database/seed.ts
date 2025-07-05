import { Database } from "@db/sqlite";
import logger from "../utilities/logger.ts";

// Simple queries to count the number of rows in the tables we want to seed
// TODO: migrate these queries to some other file in case we need to use them elsewhere
const SEED_QUERIES = {
	"appTasks": "SELECT COUNT(*) FROM app_tasks",
	"appSettings": "SELECT COUNT(*) FROM app_settings"
};

/**
 * Checks if a table is empty and calls the callback function to seed it if it is.
 * @param {Database} db - The SQLite database instance to check and seed.
 * @param {string} table - The name of the table to check.
 * @param {string} countQuery - The SQL query to count the number of rows in the table.
 * @param {Function} seedFn - The function to call to seed the table if it is empty.
 * @returns {void}
 */
function seedTableIfEmpty(
  db: Database,
  table: string,
  countQuery: string,
  seedFn: (db: Database) => void,
): void {
  const stmt = db.prepare(countQuery);
  const result = stmt.value();
  stmt.finalize();
  const count = ((result as number[] | undefined)?.[0] ?? 0);
  if (count === 0) {
    logger.info('SEED', `Seeding initial data for ${table}...`);
    seedFn(db);
  }
}

/**
 * Seeds the app_tasks table with initial data.
 * This function should be called once to ensure the table has the necessary initial task.
 * @param {Database} db - The SQLite database instance to seed.
 */
function seedAppTasks(db: Database) {
  db.exec("INSERT INTO app_tasks (task_name, interval, status) VALUES ('comic_parser', 5000, 'initialized')");
}

/**
 * Seeds the app_settings table with initial data.
 * This function should be called once to ensure the table has the necessary initial settings.
 * @param {Database} db - The SQLite database instance to seed.
 */
function seedAppSettings(db: Database) {
	db.exec("INSERT INTO app_settings (setting_name, setting_value) VALUES ('comic_folder_hash', 'NOT_SET')");
}

/**
 * Seeds the database with initial data if the specified tables are empty.
 * This function should be called once to ensure the database has the necessary initial data.
 * @param {Database} db - The SQLite database instance to seed.
 */
export function seedDatabase(db: Database) {
	seedTableIfEmpty(db, "app_tasks", SEED_QUERIES.appTasks, seedAppTasks);
	seedTableIfEmpty(db, "app_settings", SEED_QUERIES.appSettings, seedAppSettings);
}