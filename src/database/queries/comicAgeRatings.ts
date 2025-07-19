import db from "../database.ts";

export const INSERT_COMIC_AGE_RATING = `
  INSERT INTO comic_age_ratings (name)
    VALUES (?)
    ON CONFLICT(name)
    DO UPDATE SET name = excluded.name
    RETURNING id
`;

export function insertComicAgeRatingQuery(name: string): number {
  const stmt = db.prepare(INSERT_COMIC_AGE_RATING);
  const row = stmt.get<{ id: number }>(name);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic age rating");

  return row.id;
}