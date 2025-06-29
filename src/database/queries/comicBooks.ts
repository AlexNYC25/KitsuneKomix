import db from "../database.ts";
import { ComicBook } from "../interfaces/comicBook.ts";

export const GET_COMIC_BOOKS = `
  SELECT
    id,
    title,
    file_name,
    file_hash,
    file_path,
    timestamp,
    metadata_id,
    series_id
  FROM comic_books
  ORDER BY title;
`;

/**
 * Retrieves all comic books from the database.
 * @returns {Array<ComicBook>} An array of ComicBook objects.
 */
export function getComicBooksQuery(): Array<ComicBook> {
  const stmt = db.prepare(GET_COMIC_BOOKS);
  const rows = stmt.all() as Array<Record<string, unknown>>;

	if (!rows || rows.length === 0) {
		return [];
	}

  stmt.finalize();

  return rows.map(row => ({
    id: row.id as number,
    title: row.title as string,
    file_name: row.file_name as string,
    file_hash: row.file_hash as string,
    file_path: row.file_path as string,
    timestamp: row.timestamp ? new Date(row.timestamp as string) : null,
    metadata_id: row.metadata_id as number,
    series_id: row.series_id as number,
  }));
}

export const GET_COMIC_BOOK_BY_HASH = `
  SELECT
    id,
    title,
    file_name,
    file_hash,
    file_path,
    timestamp,
    metadata_id,
    series_id
  FROM comic_books
	WHERE file_hash = ?;
`;

/**
 * Retrieves a comic book by its file hash.
 * @param {string} fileHash - The hash of the comic book file.
 * @returns {ComicBook | null} The comic book if found, otherwise null.
 */
export function getComicBookByHashQuery(fileHash: string): ComicBook | null {
	const stmt = db.prepare(GET_COMIC_BOOK_BY_HASH);
	const row = stmt.get(fileHash) as Record<string, unknown> | undefined;
	stmt.finalize();

	if (!row) {
		return null;
	}

	return {
		id: row.id as number,
		title: row.title as string,
		file_name: row.file_name as string,
		file_hash: row.file_hash as string,
		file_path: row.file_path as string,
		timestamp: row.timestamp ? new Date(row.timestamp as string) : null,
		metadata_id: row.metadata_id as number,
		series_id: row.series_id as number,
	};
}

export const INSERT_COMIC_BOOK = `
	INSERT INTO comic_books (
		title,
		file_name,
		file_hash,
		file_path,
		timestamp,
		metadata_id,
		series_id
	) VALUES (?, ?, ?, ?, ?, ?, ?);
`;

/**
 * Inserts a new comic book into the database.
 * @param {string} title - The title of the comic book.
 * @param {string} fileName - The name of the comic book file.
 * @param {string} fileHash - The hash of the comic book file.
 * @param {string} filePath - The path to the comic book file.
 * @param {Date | null} timestamp - The timestamp of when the comic book was added, or null if not applicable.
 * @param {number} metadataId - The ID of the associated metadata.
 * @param {number} seriesId - The ID of the associated series.
 * 
 * TODO: Consider sending the entire comic book object instead of individual parameters.
 */
export function insertComicBookQuery(
	title: string,
	fileName: string,
	fileHash: string,
	filePath: string,
	timestamp: Date | null,
	metadataId: number,
	seriesId: number
): void {
	const stmt = db.prepare(INSERT_COMIC_BOOK);
	stmt.run(title, fileName, fileHash, filePath, timestamp ? timestamp.toISOString() : null, metadataId, seriesId);
	stmt.finalize();
}

export const UPDATE_COMIC_BOOK = `
	UPDATE comic_books
	SET
		title = ?,
		file_name = ?,
		file_hash = ?,
		file_path = ?,
		timestamp = ?,
		metadata_id = ?,
		series_id = ?
	WHERE id = ?;
`;

/**
 * Updates an existing comic book in the database.
 * @param {number} id - The ID of the comic book to update.
 * @param {string} title - The new title of the comic book.
 * @param {string} fileName - The new name of the comic book file.
 * @param {string} fileHash - The new hash of the comic book file.
 * @param {string} filePath - The new path to the comic book file.
 * @param {Date | null} timestamp - The new timestamp of when the comic book was added, or null if not applicable.
 * @param {number} metadataId - The new ID of the associated metadata.
 * @param {number} seriesId - The new ID of the associated series.
 *
 * TODO: Consider sending the entire comic book object instead of individual parameters.
*/
export function updateComicBookQuery(
	id: number,
	title: string,
	fileName: string,
	fileHash: string,
	filePath: string,
	timestamp: Date | null,
	metadataId: number,
	seriesId: number
): void {
	const stmt = db.prepare(UPDATE_COMIC_BOOK);
	stmt.run(title, fileName, fileHash, filePath, timestamp ? timestamp.toISOString() : null, metadataId, seriesId, id);
	stmt.finalize();
}
