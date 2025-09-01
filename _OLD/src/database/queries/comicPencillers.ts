import db from "../database.ts";

export const INSERT_COMIC_PENCILLER = `
  INSERT INTO comic_pencillers (name)
    VALUES (?)
    ON CONFLICT(name)
    DO UPDATE SET name = excluded.name
    RETURNING id
`;

/**
 * Inserts a new comic penciller into the database.
 * @param {string} name - The name of the comic penciller.
 * @throws Will throw an error if the insertion fails.
 * @returns {number} The ID of the inserted comic penciller.
 */
export function insertComicPencillerQuery(name: string): number {
  const stmt = db.prepare(INSERT_COMIC_PENCILLER);
  const row = stmt.get<{ id: number }>(name);
  stmt.finalize();
  
  if (!row) throw new Error("Failed to insert comic penciller");
  
  return row.id;
}