import db from "../database.ts";

export const INSERT_COMIC_SERIES_GROUP = `
  INSERT INTO comic_series_groups (metadata_id, series_group_id)
    VALUES (?, ?)
    ON CONFLICT(metadata_id, series_group_id)
    DO UPDATE SET metadata_id = excluded.metadata_id, series_group_id = excluded.series_group_id
    RETURNING id
`;

/**
 * Inserts a new comic metadata series group into the database.
 * @param {number} metadataId The ID of the comic metadata.
 * @param {number} seriesGroupId The ID of the series group.
 * @returns {number} The ID of the inserted or updated series group.
 * @throws {Error} If the insertion fails.
 */
export function insertComicMetadataSeriesGroupQuery(
  metadataId: number,
  seriesGroupId: number
): number {
  const stmt = db.prepare(INSERT_COMIC_SERIES_GROUP);
  const row = stmt.get<{ id: number }>(metadataId, seriesGroupId);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert or update comic metadata series group");

  return row.id;
}