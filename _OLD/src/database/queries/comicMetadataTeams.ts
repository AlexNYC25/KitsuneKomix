import db from "../database.ts";

export const INSERT_COMIC_METADATA_TEAM = `
  INSERT INTO comic_metadata_teams (metadata_id, team_id)
    VALUES (?, ?)
    ON CONFLICT(metadata_id, team_id)
    DO UPDATE SET metadata_id = excluded.metadata_id, team_id = excluded.team_id
    RETURNING id
`;

/**
 * Inserts a comic metadata team into the database.
 * @param {number} metadataId The ID of the comic metadata.
 * @param {number} teamId The ID of the team.
 * @returns {number} The ID of the inserted or updated team.
 * @throws {Error} If the insertion fails.
 */
export function insertComicMetadataTeamQuery(metadataId: number, teamId: number): number {
  const stmt = db.prepare(INSERT_COMIC_METADATA_TEAM);
  const row = stmt.get<{ id: number }>(metadataId, teamId);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic metadata team");

  return row.id;
}