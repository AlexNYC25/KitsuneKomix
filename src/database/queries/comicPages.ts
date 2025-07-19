import db from "../database.ts";
import { ComicPage } from "../../interfaces/comic-page.interface.ts";

export const INSERT_COMIC_PAGE = `
  INSERT INTO comic_pages (page_number, double_page, image_size, image_path, key_image, image_width, image_height, image_hash, page_type_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  RETURNING id
`;

/**
 * Inserts a new comic page into the database.
 * @param {ComicPage} comicPage - The comic page to insert.
 * @throws Will throw an error if the insertion fails.
 * @returns {number} The ID of the inserted comic page.
 */
export function insertComicPageQuery(
  comicPage: ComicPage
): number {
  const stmt = db.prepare(INSERT_COMIC_PAGE);
  const row = stmt.get<{ id: number }>(
    comicPage.page_number,
    comicPage.double_page,
    comicPage.image_size,
    comicPage.image_path,
    comicPage.key_image,
    comicPage.image_width,
    comicPage.image_height,
    comicPage.image_hash,
    comicPage.page_type_id
  );
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic page");

  return row.id;
}



