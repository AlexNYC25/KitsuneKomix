import db from "../database.ts";

export const INSERT_COMIC_COVER_ARTIST = `
  INSERT INTO comic_cover_artists (name)
    VALUES (?)
    ON CONFLICT(name)
    DO UPDATE SET name = excluded.name
    RETURNING id
`;

/**
 * Inserts a comic cover artist into the database or updates it if it already exists.
 * @param {string} name - The name of the comic cover artist to insert.
 * @throws Will throw an error if the insertion fails.
 * @returns {number} The ID of the inserted or updated comic cover artist.
 */
export function insertComicCoverArtistQuery(name: string): number {
  const stmt = db.prepare(INSERT_COMIC_COVER_ARTIST);
  const row = stmt.get<{ id: number }>(name);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic cover artist");

  return row.id;
}