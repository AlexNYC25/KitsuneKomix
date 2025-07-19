import db from "../database.ts";

export const INSERT_COMIC_SERIES_GROUP = `
  INSERT INTO comic_series_groups (name)
    VALUES (?)
    ON CONFLICT(name)
    DO UPDATE SET name = excluded.name
    RETURNING id
`;

/**
 * Inserts a new comic series group into the database.
 * @param {string} name - The name of the comic series group.
 * @throws Will throw an error if the insertion fails.
 * @returns {number} The ID of the inserted comic series group.
 */
export function insertComicSeriesGroupQuery(name: string): number {
  const stmt = db.prepare(INSERT_COMIC_SERIES_GROUP);
  const row = stmt.get<{ id: number }>(name);
  stmt.finalize();
  
  if (!row) throw new Error("Failed to insert comic series group");
  
  return row.id;
}