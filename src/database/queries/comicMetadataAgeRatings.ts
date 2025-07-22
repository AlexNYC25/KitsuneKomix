import db from "../database.ts";

export const INSERT_COMIC_METADATA_AGE_RATING = `
  INSERT INTO comic_metadata_age_ratings (metadata_id, age_rating_id)
    VALUES (?, ?)
    ON CONFLICT(metadata_id, age_rating_id)
    DO UPDATE SET metadata_id = excluded.metadata_id, age_rating_id = excluded.age_rating_id
    RETURNING id
`;

/**
 * Inserts a comic metadata age rating into the database.
 * @param {number} metadataId The ID of the comic metadata.
 * @param {number} ageRatingId The ID of the age rating.
 * @returns {number} The ID of the inserted or updated age rating.
 * @throws {Error} If the insertion fails.
 */
export function insertComicMetadataAgeRatingQuery(metadataId: number, ageRatingId: number): number {
  const stmt = db.prepare(INSERT_COMIC_METADATA_AGE_RATING);
  const row = stmt.get<{ id: number }>(metadataId, ageRatingId);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic metadata age rating");

  return row.id;
}