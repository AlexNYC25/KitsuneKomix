import db from "../database.ts";

export const INSERT_COMIC_STORY_ARC = `
  INSERT INTO comic_story_arcs (title, description)
    VALUES (?, ?)
    ON CONFLICT(title)
    DO UPDATE SET description = excluded.description
    RETURNING id
`;

/**
 * Inserts a new comic story arc into the database.
 * @param {string} title - The title of the comic story arc.
 * @param {string} [description] - Optional description of the comic story arc.
 * @throws Will throw an error if the insertion fails.
 * @returns {number} The ID of the inserted comic story arc.
 */
export function insertComicStoryArcQuery(title: string, description?: string): number {
  const stmt = db.prepare(INSERT_COMIC_STORY_ARC);
  const row = stmt.get<{ id: number }>(title, description || null);
  stmt.finalize();
  
  if (!row) throw new Error("Failed to insert comic story arc");
  
  return row.id;
}