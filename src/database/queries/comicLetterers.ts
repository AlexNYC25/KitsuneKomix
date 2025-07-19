import db from "../database.ts";

export const INSERT_COMIC_LETTERER = `
  INSERT INTO comic_letterers (name)
    VALUES (?)
    ON CONFLICT(name)
    DO UPDATE SET name = excluded.name
    RETURNING id
`;

/**
 * Inserts a new comic letterer into the database.
 * @param {string} name - The name of the comic letterer.
 * @throws Will throw an error if the insertion fails.
 * @returns {number} The ID of the inserted comic letterer.
 */
export function insertComicLettererQuery(name: string): number {
  const stmt = db.prepare(INSERT_COMIC_LETTERER);
  const row = stmt.get<{ id: number }>(name);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic letterer");

  return row.id;
}