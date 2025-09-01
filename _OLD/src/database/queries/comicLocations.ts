import db from "../database.ts";

export const INSERT_COMIC_LOCATION = `
  INSERT INTO comic_locations (name)
    VALUES (?)
    ON CONFLICT(name)
    DO UPDATE SET name = excluded.name
    RETURNING id
`;

/**
 * Inserts a comic location into the database or updates it if it already exists.
 * @param {string} name - The name of the comic location to insert.
 * @throws Will throw an error if the insertion fails.
 * @returns {number} The ID of the inserted or updated comic location.
 */
export function insertComicLocationQuery(name: string): number {
  const stmt = db.prepare(INSERT_COMIC_LOCATION);
  const row = stmt.get<{ id: number }>(name);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic location");

  return row.id;
}