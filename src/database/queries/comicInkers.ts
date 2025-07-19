import db from "../database.ts";

export const INSERT_COMIC_INKER = `
  INSERT INTO comic_inkers (name)
    VALUES (?)
    ON CONFLICT(name)
    DO UPDATE SET name = excluded.name
    RETURNING id
`;

/**
 * Inserts a new comic inker into the database.
 * @param {string} name - The name of the comic inker.
 * @throws Will throw an error if the insertion fails.
 * @returns {number} The ID of the inserted comic inker.
 */
export function insertComicInkerQuery(name: string): number {
  const stmt = db.prepare(INSERT_COMIC_INKER);
  const row = stmt.get<{ id: number }>(name);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic inker");

  return row.id;
}