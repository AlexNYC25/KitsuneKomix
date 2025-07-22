import db from "../database.ts";

export const INSERT_COMIC_METADATA_INKER = `
  INSERT INTO comic_metadata_inkers (metadata_id, inker_id)
    VALUES (?, ?)
    ON CONFLICT(metadata_id, inker_id)
    DO UPDATE SET metadata_id = excluded.metadata_id, inker_id = excluded.inker_id
    RETURNING id
`;

/**
 * Inserts a comic metadata inker into the database.
 * @param {number} metadataId The ID of the comic metadata.
 * @param {number} inkerId The ID of the inker.
 * @returns {number} The ID of the inserted or updated inker.
 * @throws {Error} If the insertion fails.
 */
export function insertComicMetadataInkerQuery(metadataId: number, inkerId: number): number {
  const stmt = db.prepare(INSERT_COMIC_METADATA_INKER);
  const row = stmt.get<{ id: number }>(metadataId, inkerId);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic metadata inker");

  return row.id;
}