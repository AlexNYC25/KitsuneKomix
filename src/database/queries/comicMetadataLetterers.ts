import db from "../database.ts";

export const INSERT_COMIC_METADATA_LETTERER = `
  INSERT INTO comic_metadata_letterers (metadata_id, letterer_id)
    VALUES (?, ?)
    ON CONFLICT(metadata_id, letterer_id)
    DO UPDATE SET metadata_id = excluded.metadata_id, letterer_id = excluded.letterer_id
    RETURNING id
`;

/**
 * Inserts a new comic letterer into the database.
 * @param {number} metadataId The ID of the comic metadata.
 * @param {number} lettererId The ID of the letterer.
 * @returns {number} The ID of the inserted or updated letterer.
 * @throws {Error} If the insertion fails.
 */
export function insertComicMetadataLettererQuery(metadataId: number, lettererId: number): number {
  const stmt = db.prepare(INSERT_COMIC_METADATA_LETTERER);
  const row = stmt.get<{ id: number }>(metadataId, lettererId);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic metadata letterer");

  return row.id;
}