import db from "../database.ts";

export const INSERT_COMIC_METADATA_CHARACTER = `
  INSERT INTO comic_metadata_characters (metadata_id, character_id)
    VALUES (?, ?)
    ON CONFLICT(metadata_id, character_id)
    DO UPDATE SET metadata_id = excluded.metadata_id, character_id = excluded.character_id
    RETURNING id
`;

/**
 * Inserts a comic metadata character into the database.
 * @param {number} metadataId The ID of the comic metadata.
 * @param {number} characterId The ID of the character.
 * @returns {number} The ID of the inserted or updated character.
 * @throws {Error} If the insertion fails.
 */
export function insertComicMetadataCharacterQuery(metadataId: number, characterId: number): number {
  const stmt = db.prepare(INSERT_COMIC_METADATA_CHARACTER);
  const row = stmt.get<{ id: number }>(metadataId, characterId);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic metadata character");

  return row.id;
}