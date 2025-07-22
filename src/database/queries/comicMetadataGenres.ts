import db from "../database.ts";

export const INSERT_COMIC_METADATA_GENRE = `
  INSERT INTO comic_metadata_genres (metadata_id, genre_id)
    VALUES (?, ?)
    ON CONFLICT(metadata_id, genre_id)
    DO UPDATE SET metadata_id = excluded.metadata_id, genre_id = excluded.genre_id
    RETURNING id
`;

/**
 * Inserts a comic metadata genre into the database.
 * @param {number} metadataId The ID of the comic metadata.
 * @param {number} genreId The ID of the genre.
 * @returns {number} The ID of the inserted or updated genre.
 * @throws {Error} If the insertion fails.
 */
export function insertComicMetadataGenreQuery(metadataId: number, genreId: number): number {
  const stmt = db.prepare(INSERT_COMIC_METADATA_GENRE);
  const row = stmt.get<{ id: number }>(metadataId, genreId);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic metadata genre");

  return row.id;
}