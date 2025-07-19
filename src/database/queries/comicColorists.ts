import db from "../database.ts";

export const INSERT_COMIC_COLORIST = `
  INSERT INTO comic_colorists (name)
    VALUES (?)
    ON CONFLICT(name)
    DO UPDATE SET name = excluded.name
    RETURNING id
`;

/**
 * Inserts a new comic colorist into the database.
 * @param {string} name - The name of the comic colorist.
 * @throws Will throw an error if the insertion fails.
 * @returns {number} The ID of the inserted comic colorist.
 */
export function insertComicColoristQuery(name: string): number {
  const stmt = db.prepare(INSERT_COMIC_COLORIST);
  const row = stmt.get<{ id: number }>(name);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic colorist");

  return row.id;
}