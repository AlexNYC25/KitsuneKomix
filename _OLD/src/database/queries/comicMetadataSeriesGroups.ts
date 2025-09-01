import db from "../database.ts";

export const INSERT_COMIC_METADATA_SERIES_GROUP = `
  INSERT INTO comic_metadata_series_groups (metadata_id, series_group_id)
  VALUES (?, ?)
  ON CONFLICT(metadata_id, series_group_id) DO UPDATE SET
    metadata_id = excluded.metadata_id,
    series_group_id = excluded.series_group_id
  RETURNING id;
`;

/**
 * Inserts or updates a comic metadata series group in the database.
 * If the combination of metadata_id and series_group_id already exists,
 * it updates the existing record; otherwise, it inserts a new one.
 * @param {number} metadataId - The ID of the comic metadata.
 * @param {number} seriesGroupId - The ID of the series group.
 * @returns {number} - The ID of the inserted or updated series group.
 */
export function insertOrUpdateComicMetadataSeriesGroup(
  metadataId: number,
  seriesGroupId: number
): number {
  const stmt = db.prepare(INSERT_COMIC_METADATA_SERIES_GROUP);
  const row = stmt.get<{ id: number }>(metadataId, seriesGroupId);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert or update comic metadata series group");

  return row.id;
}