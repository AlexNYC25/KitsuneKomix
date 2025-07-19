import db from "../database.ts";

export const GET_COMIC_PAGE_TYPE = `
  SELECT id FROM comic_page_types WHERE name = ?
`;

/**
 * Retrieves the ID of a comic page type by its name.
 * @param name - The name of the comic page type.
 * @returns The ID of the comic page type, or null if not found.
 */
export function getComicPageTypeId(name: string): number | null {
  const stmt = db.prepare(GET_COMIC_PAGE_TYPE);
  const row = stmt.get<{ id: number }>(name);
  stmt.finalize();

  if (!row) return null;

  return row.id;
}