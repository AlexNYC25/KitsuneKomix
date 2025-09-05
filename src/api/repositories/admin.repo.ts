import { getDatabase } from "../config/db/sqliteConnection.ts";

export function purgeAllData() {
  const db = getDatabase();

  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%';
  `).all() as Array<{ name: string }>;

  for (const table of tables) {
    const stmt = db.prepare(`DELETE FROM ${table.name};`);
    stmt.run();

    // reset auto-incrementing primary keys
    const resetStmt = db.prepare(`DELETE FROM sqlite_sequence WHERE name = ?;`);
    resetStmt.run(table.name);
  }
}
