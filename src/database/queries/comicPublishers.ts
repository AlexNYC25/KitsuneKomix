import db from "../database.ts";

export const INSERT_COMIC_PUBLISHER = `
  INSERT INTO comic_publishers (name)
  VALUES (?)
  ON CONFLICT(name) DO NOTHING
  RETURNING id
`;

/**
 * Inserts a new comic publisher into the database.
 * @param name - The name of the comic publisher.
 * @throws Will throw an error if the insertion fails.
 * @returns The ID of the inserted comic publisher.
 */
export function insertComicPublisherQuery(name: string): number {
  const stmt = db.prepare(INSERT_COMIC_PUBLISHER);
  const row = stmt.get<{ id: number }>(name);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic publisher");

  return row.id;
}
