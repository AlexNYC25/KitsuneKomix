import { getClient } from "../drizzle/client";

import type { DrizzleType } from "../shared/types/index.ts";

/**
 * Purge all data from all tables in the database.
 * This function deletes all records from every table
 * and resets any auto-incrementing primary keys.
 *
 * Purly for testing purposes.
 * NOTE: REALLY DESTRUCTIVE OPERATION. USE WITH CAUTION.
 */
export const purgeAllData = async () => {
  const db: DrizzleType = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    // Get all table names except system tables
    const tables: {name: string}[] = db.$client.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__drizzle_%';
    `).all() as {name: string}[];

    // Delete all data from each table
    for (const row of tables) {
      const tableName: string = row.name as string;
      db.$client.run(`DELETE FROM ${tableName}`);
    }

    // Reset auto-incrementing primary keys
    for (const row of tables) {
      const tableName: string = row.name as string;
      db.$client.run(`DELETE FROM sqlite_sequence WHERE name='${tableName}'`);
    }
  } finally {
    // Close the client connection
    db.$client.close();
  }
};
