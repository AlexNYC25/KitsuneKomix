import db from "../database.ts";

export const INSERT_COMIC_EDITOR = `
  INSERT INTO comic_editors (name)
    VALUES (?)
    ON CONFLICT(name)
    DO UPDATE SET name = excluded.name
    RETURNING id
`;

/**
 * Inserts a comic editor into the database or updates it if it already exists.
 * @param {string} name - The name of the comic editor to insert.
 * @throws Will throw an error if the insertion fails.
 * @returns {number} The ID of the inserted or updated comic editor.
 */
export function insertComicEditorQuery(name: string): number {
  const stmt = db.prepare(INSERT_COMIC_EDITOR);
  const row = stmt.get<{ id: number }>(name);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic editor");

  return row.id;
}