import { createNewClient } from "../client.ts";

export const purgeAllData = async () => {
  const { db, client } = createNewClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    // Get all table names except system tables
    const tables = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__drizzle_%';
    `);

    // Delete all data from each table
    for (const row of tables.rows) {
      const tableName = row[0] as string;
      await client.execute(`DELETE FROM ${tableName}`);
    }

    // Reset auto-incrementing primary keys
    for (const row of tables.rows) {
      const tableName = row[0] as string;
      await client.execute({
        sql: `DELETE FROM sqlite_sequence WHERE name = ?`,
        args: [tableName]
      });
    }
  } finally {
    // Close the client connection
    client.close();
  }
};