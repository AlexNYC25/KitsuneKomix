import db from "../database.ts";

export const INSERT_COMIC_METADATA_COLORIST = `
  INSERT INTO comic_metadata_colorists (metadata_id, colorist_id)
    VALUES (?, ?)
    ON CONFLICT(metadata_id, colorist_id)
    DO NOTHING
    RETURNING id
`;

/**
 * Inserts a new comic metadata colorist into the database.
 * @param {number} comicMetadataId - The ID of the comic metadata.
 * @param {number} coloristId - The ID of the colorist.
 * @returns {number} The ID of the inserted comic metadata colorist.
 * @throws {Error} If the insertion fails.
 */
export function insertComicMetadataColoristQuery(comicMetadataId: number, coloristId: number): number {
  const stmt = db.prepare(INSERT_COMIC_METADATA_COLORIST);
  const row = stmt.get<{ id: number }>(comicMetadataId, coloristId);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic metadata colorist");

  return row.id;
}