import db from "../database.ts";

export const INSERT_COMIC_WRITER = `
  INSERT INTO comic_writers (name)
    VALUES (?)
    ON CONFLICT(name)
    DO UPDATE SET name = excluded.name
    RETURNING id
`;

/**
 * Inserts a new comic writer into the database.
 * @param {string} name - The name of the comic writer.
 * @throws Will throw an error if the insertion fails.
 * @returns {number} The ID of the inserted comic writer.
 */
export function insertComicWriterQuery(name: string): number {
  const stmt = db.prepare(INSERT_COMIC_WRITER);
  const row = stmt.get<{ id: number }>(name);
  stmt.finalize();
  
  if (!row) throw new Error("Failed to insert comic writer");
  
  return row.id;
}