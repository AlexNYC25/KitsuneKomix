import db from "../database.ts";

export const INSERT_COMIC_GENRE = `
  INSERT INTO comic_genre (name)
    VALUES (?)
    ON CONFLICT(name)
    DO UPDATE SET name = excluded.name
    RETURNING id
`;

/**
 * Inserts a comic genre into the database or updates it if it already exists.
 * @param {string} name - The name of the comic genre to insert.
 * @throws Will throw an error if the insertion fails.
 * @returns {number} The ID of the inserted or updated comic genre.
 */
export function insertComicGenreQuery(name: string): number {
  const stmt = db.prepare(INSERT_COMIC_GENRE);
  const row = stmt.get<{ id: number }>(name);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic genre");

  return row.id;
}