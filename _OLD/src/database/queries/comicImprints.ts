import db from "../database.ts";

export const INSERT_COMIC_IMPRINT = `
  INSERT INTO comic_imprints (name)
    VALUES (?)
    ON CONFLICT(name)
    DO UPDATE SET name = excluded.name
    RETURNING id
`;

/**
 * Inserts a comic imprint into the database or updates it if it already exists.
 * @param {string} name - The name of the comic imprint to insert.
 * @throws Will throw an error if the insertion fails.
 * @returns {number} The ID of the inserted or updated comic imprint.
 */
export function insertComicImprintQuery(name: string): number {
  const stmt = db.prepare(INSERT_COMIC_IMPRINT);
  const row = stmt.get<{ id: number }>(name);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic imprint");

  return row.id;
}
