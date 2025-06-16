import { Database } from "@db/sqlite";
import logger from "../utilities/logger.ts";

const SEED_QUERIES = {
	"appTasks": "SELECT COUNT(*) FROM app_tasks",
	"appSettings": "SELECT COUNT(*) FROM app_settings"
};

// Generic seeding helper
function seedTableIfEmpty(
  db: Database,
  table: string,
  countQuery: string,
  seedFn: (db: Database) => void,
) {
  const stmt = db.prepare(countQuery);
  const result = stmt.value();
  stmt.finalize();
  const count = ((result as number[] | undefined)?.[0] ?? 0);
  if (count === 0) {
    logger.info('SEED', `Seeding initial data for ${table}...`);
    seedFn(db);
  }
}

export function seedDatabase(db: Database) {
	seedTableIfEmpty(db, "app_tasks", SEED_QUERIES.appTasks, seedAppTasks);
	seedTableIfEmpty(db, "app_settings", SEED_QUERIES.appSettings, seedAppSettings);
}

function seedAppTasks(db: Database) {
  db.exec("INSERT INTO app_tasks (task_name, interval, status) VALUES ('comic_parser', 5000, 'initilized')");
}

function seedAppSettings(db: Database) {
	db.exec("INSERT INTO app_settings (setting_name, setting_value) VALUES ('comic_folder_hash', 'NOT_SET')");
}