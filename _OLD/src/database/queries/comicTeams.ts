import db from "../database.ts";

export const INSERT_COMIC_TEAMS = `
  INSERT INTO comic_teams (name)
    VALUES (?)
    ON CONFLICT(name)
    DO UPDATE SET name = excluded.name
    RETURNING id
`;

/**
 * Inserts a new comic team into the database.
 * @param {string} name - The name of the comic team.
 * @throws Will throw an error if the insertion fails.
 * @returns {number} The ID of the inserted comic team.
 */
export function insertComicTeamQuery(name: string): number {
  const stmt = db.prepare(INSERT_COMIC_TEAMS);
  const row = stmt.get<{ id: number }>(name);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic team");

  return row.id;
}

