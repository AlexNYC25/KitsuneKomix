import db from "../database.ts";

export const INSERT_COMIC_METADATA_EDITOR = `
  INSERT INTO comic_metadata_editors (metadata_id, editor_id)
    VALUES (?, ?)
    ON CONFLICT(metadata_id, editor_id)
    DO NOTHING
    RETURNING id
`;

/**
 * Inserts a new comic metadata editor into the database.
 * @param {number} comicMetadataId - The ID of the comic metadata.
 * @param {number} editorId - The ID of the editor.
 * @returns {number} The ID of the inserted comic metadata editor.
 * @throws {Error} If the insertion fails.
 */
export function insertComicMetadataEditorQuery(comicMetadataId: number, editorId: number): number {
  const stmt = db.prepare(INSERT_COMIC_METADATA_EDITOR);
  const row = stmt.get<{ id: number }>(comicMetadataId, editorId);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic metadata editor");

  return row.id;
}