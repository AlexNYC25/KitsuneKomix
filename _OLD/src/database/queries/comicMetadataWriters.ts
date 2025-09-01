import db from "../database.ts";

export const INSERT_COMIC_METADATA_WRITER = `
    INSERT INTO comic_metadata_writers (metadata_id, writer_id)
    VALUES (?, ?)
    ON CONFLICT(metadata_id, writer_id)
    DO UPDATE SET metadata_id = excluded.metadata_id, writer_id = excluded.writer_id
    RETURNING id
`;

/**
 * Inserts a new comic metadata writer into the database.
 * @param {number} comicMetadataId - The ID of the comic metadata.
 * @param {number} writerId - The ID of the writer.
 * @returns {number} The ID of the inserted comic metadata writer.
 * @throws {Error} If the insertion fails.
 */
export function insertComicMetadataWriterQuery(comicMetadataId: number, writerId: number): number {
  const stmt = db.prepare(INSERT_COMIC_METADATA_WRITER);
  const row = stmt.get<{ id: number }>(comicMetadataId, writerId);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic metadata writer");

  return row.id;
}
