import db from "../database.ts";

export const INSERT_COMIC_METADATA_IMPRINT = `
  INSERT INTO comic_metadata_imprints (metadata_id, imprint_id)
    VALUES (?, ?)
    ON CONFLICT(metadata_id, imprint_id)
    DO UPDATE SET metadata_id = excluded.metadata_id, imprint_id = excluded.imprint_id
    RETURNING id
`;

/**
 * Inserts a comic metadata imprint into the database.
 * @param {number} metadataId The ID of the comic metadata.
 * @param {number} imprintId The ID of the imprint.
 * @returns {number} The ID of the inserted or updated imprint.
 * @throws {Error} If the insertion fails.
 */
export function insertComicMetadataImprintQuery(metadataId: number, imprintId: number): number {
  const stmt = db.prepare(INSERT_COMIC_METADATA_IMPRINT);
  const row = stmt.get<{ id: number }>(metadataId, imprintId);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic metadata imprint");

  return row.id;
}