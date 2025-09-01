import db from "../database.ts";

export const INSERT_COMIC_CHARACTER = `
  INSERT INTO comic_characters (name)
    VALUES (?)
    ON CONFLICT(name)
    DO UPDATE SET name = excluded.name
    RETURNING id
`;

/**
 * Inserts a comic character into the database or updates it if it already exists.
 * @param {string} name - The name of the comic character to insert.
 * @throws Will throw an error if the insertion fails.
 * @returns {number} The ID of the inserted or updated comic character.
 */
export function insertComicCharacterQuery(name: string): number {
  const stmt = db.prepare(INSERT_COMIC_CHARACTER);
  const row = stmt.get<{ id: number }>(name);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic character");

  return row.id;
}