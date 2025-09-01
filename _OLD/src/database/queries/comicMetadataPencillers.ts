import db from "../database.ts";

export const INSERT_COMIC_METADATA_PENCILLER = `
  INSERT INTO comic_metadata_pencillers (metadata_id, penciller_id)
    VALUES (?, ?)
    ON CONFLICT(metadata_id, penciller_id)
    DO NOTHING
    RETURNING id
`;

/**
 * Inserts a new comic metadata penciller into the database.
 * @param {number} comicMetadataId - The ID of the comic metadata.
 * @param {number} pencillerId - The ID of the penciller.
 * @returns {number} The ID of the inserted comic metadata penciller.
 * @throws {Error} If the insertion fails.
 */
export function insertComicMetadataPencillerQuery(comicMetadataId: number, pencillerId: number): number {
  const stmt = db.prepare(INSERT_COMIC_METADATA_PENCILLER);
  const row = stmt.get<{ id: number }>(comicMetadataId, pencillerId);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic metadata penciller");

  return row.id;
}
