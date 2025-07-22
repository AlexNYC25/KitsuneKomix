import db from "../database.ts";

export const INSERT_COMIC_METADATA_PAGE = `
  INSERT INTO comic_metadata_pages (metadata_id, page_id)
  VALUES (?, ?)
  RETURNING id
`;

/**
 * Inserts a comic metadata page into the database.
 * @param {number} metadataId The ID of the comic metadata.
 * @param {number} pageId The ID of the page.
 * @returns {number} The ID of the inserted or updated page.
 * @throws {Error} If the insertion fails.
 */
export function insertComicMetadataPageQuery(
  metadataId: number,
  pageId: number
): number {
  const stmt = db.prepare(INSERT_COMIC_METADATA_PAGE);
  const row = stmt.get<{ id: number }>(
    metadataId,
    pageId
  );
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic metadata page");

  return row.id;
}
