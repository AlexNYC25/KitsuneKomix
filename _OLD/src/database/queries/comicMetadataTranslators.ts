import db from "../database.ts";

export const INSERT_COMIC_METADATA_TRANSLATOR = `
  INSERT INTO comic_metadata_translators (metadata_id, translator_id)
    VALUES (?, ?)
    ON CONFLICT(metadata_id, translator_id)
    DO UPDATE SET metadata_id = excluded.metadata_id, translator_id = excluded.translator_id
    RETURNING id
`;

/**
 * Inserts a comic metadata translator into the database.
 * @param {number} metadataId The ID of the comic metadata.
 * @param {number} translatorId The ID of the translator.
 * @returns {number} The ID of the inserted or updated translator.
 * @throws {Error} If the insertion fails.
 */
export function insertComicMetadataTranslatorQuery(metadataId: number, translatorId: number): number {
  const stmt = db.prepare(INSERT_COMIC_METADATA_TRANSLATOR);
  const row = stmt.get<{ id: number }>(metadataId, translatorId);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic metadata translator");

  return row.id;
}