import db from "../database.ts";

export const INSERT_COMIC_METADATA_LOCATION = `
  INSERT INTO comic_metadata_locations (metadata_id, location_id)
    VALUES (?, ?)
    ON CONFLICT(metadata_id, location_id)
    DO UPDATE SET metadata_id = excluded.metadata_id, location_id = excluded.location_id
    RETURNING id
`;

/**
 * Inserts a comic metadata location into the database.
 * @param {number} metadataId The ID of the comic metadata.
 * @param {number} locationId The ID of the location.
 * @returns {number} The ID of the inserted or updated location.
 * @throws {Error} If the insertion fails.
 */
export function insertComicMetadataLocationQuery(metadataId: number, locationId: number): number {
  const stmt = db.prepare(INSERT_COMIC_METADATA_LOCATION);
  const row = stmt.get<{ id: number }>(metadataId, locationId);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic metadata location");

  return row.id;
}