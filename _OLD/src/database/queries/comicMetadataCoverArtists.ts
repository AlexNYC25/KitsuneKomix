import db from "../database.ts";

export const INSERT_COMIC_METADATA_COVER_ARTIST = `
  INSERT INTO comic_metadata_cover_artists (metadata_id, cover_artist_id)
    VALUES (?, ?)
    ON CONFLICT(metadata_id, cover_artist_id)
    DO UPDATE SET metadata_id = excluded.metadata_id, cover_artist_id = excluded.cover_artist_id
    RETURNING id
`;

/**
 * Inserts a comic metadata cover artist into the database.
 * @param {number} metadataId The ID of the comic metadata.
 * @param {number} coverArtistId The ID of the cover artist.
 * @returns {number} The ID of the inserted or updated cover artist.
 * @throws {Error} If the insertion fails.
 */
export function insertComicMetadataCoverArtistQuery(metadataId: number, coverArtistId: number): number {
  const stmt = db.prepare(INSERT_COMIC_METADATA_COVER_ARTIST);
  const row = stmt.get<{ id: number }>(metadataId, coverArtistId);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic metadata cover artist");

  return row.id;
}
