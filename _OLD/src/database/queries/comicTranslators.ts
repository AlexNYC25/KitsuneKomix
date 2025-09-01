import db from "../database.ts";

export const INSERT_COMIC_TRANSLATOR = `
  INSERT INTO comic_translators (name)
    VALUES (?)
    ON CONFLICT(name)
    DO UPDATE SET name = excluded.name
    RETURNING id
`;

/**
 * Inserts a new comic translator into the database.
 * @param {string} name - The name of the comic translator.
 * @throws Will throw an error if the insertion fails.
 * @returns {number} The ID of the inserted comic translator.
 */
export function insertComicTranslatorQuery(name: string): number {
  const stmt = db.prepare(INSERT_COMIC_TRANSLATOR);
  const row = stmt.get<{ id: number }>(name);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic translator");

  return row.id;
}