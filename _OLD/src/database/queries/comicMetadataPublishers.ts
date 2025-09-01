import db from "../database.ts";

export const INSERT_COMIC_METADATA_PUBLISHER = `
  INSERT INTO comic_metadata_publishers (metadata_id, publisher_id)
    VALUES (?, ?)
    ON CONFLICT(metadata_id, publisher_id)
    DO UPDATE SET metadata_id = excluded.metadata_id, publisher_id = excluded.publisher_id
    RETURNING id
`;

/**
 * Inserts a comic metadata publisher into the database.
 * @param {number} metadataId The ID of the comic metadata.
 * @param {number} publisherId The ID of the publisher.
 * @returns {number} The ID of the inserted or updated publisher.
 * @throws {Error} If the insertion fails.
 */
export function insertComicMetadataPublisherQuery(metadataId: number, publisherId: number): number {
  const stmt = db.prepare(INSERT_COMIC_METADATA_PUBLISHER);
  const row = stmt.get<{ id: number }>(metadataId, publisherId);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic metadata publisher");

  return row.id;
}