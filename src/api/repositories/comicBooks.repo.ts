import { getDatabase } from "../config/db/sqliteConnection.ts";
import { NewComicBook, ComicBookRow } from "../types/comicBook.type.ts";

function mapRowToComicBook(row: Record<string, unknown>): ComicBookRow {
  return {
    id: row.id as number,
    library_id: row.library_id as number,
    file_path: row.file_path as string,
    title: row.title as string,
    series: row.series as string | null,
    issue_number: row.issue_number as string | null,
    volume: row.volume as string | null,
    publisher: row.publisher as string | null,
    publication_date: row.publication_date as string | null,
    tags: row.tags as string | null,
    read: Boolean(row.read),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export const insertComicBook = (comicData: NewComicBook): number => {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO comic_books (library_id, file_path, title, series, issue_number, volume, publisher, publication_date, tags, read)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    comicData.libraryId,
    comicData.filePath,
    comicData.title,
    comicData.series ?? null,
    comicData.issueNumber ?? null,
    comicData.volume ?? null,
    comicData.publisher ?? null,
    comicData.publicationDate ?? null,
    comicData.tags ? comicData.tags.join(", ") : null,
    0, // New comics are unread by default
  );

  const id = db.lastInsertRowId;
  return id;
};

export const getComicBookById = (id: number): ComicBookRow | undefined => {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM comic_books WHERE id = ?");
  const row = stmt.get(id) as Record<string, unknown> | undefined;
  return row ? mapRowToComicBook(row) : undefined;
};

export const getComicBookByFilePath = (filePath: string): ComicBookRow | undefined => {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM comic_books WHERE file_path = ?");
  const row = stmt.get(filePath) as Record<string, unknown> | undefined;
  return row ? mapRowToComicBook(row) : undefined;
};

export const updateComicBook = (id: number, updates: Partial<NewComicBook>): boolean => {
  const db = getDatabase();
  const fields = [];
  const values = [];

  if (updates.title !== undefined) {
    fields.push("title = ?");
    values.push(updates.title);
  }
  if (updates.series !== undefined) {
    fields.push("series = ?");
    values.push(updates.series);
  }
  if (updates.issueNumber !== undefined) {
    fields.push("issue_number = ?");
    values.push(updates.issueNumber);
  }
  if (updates.volume !== undefined) {
    fields.push("volume = ?");
    values.push(updates.volume);
  }
  if (updates.publisher !== undefined) {
    fields.push("publisher = ?");
    values.push(updates.publisher);
  }
  if (updates.publicationDate !== undefined) {
    fields.push("publication_date = ?");
    values.push(updates.publicationDate);
  }
  if (updates.tags !== undefined) {
    fields.push("tags = ?");
    values.push(updates.tags.join(", "));
  }
  if (updates.filePath !== undefined) {
    fields.push("file_path = ?");
    values.push(updates.filePath);
  }
  if (updates.libraryId !== undefined) {
    fields.push("library_id = ?");
    values.push(updates.libraryId);
  }

  if (fields.length === 0) {
    return false; // Nothing to update
  }

  // Always update the updated_at timestamp
  fields.push("updated_at = CURRENT_TIMESTAMP");

  const sql = `UPDATE comic_books SET ${fields.join(", ")} WHERE id = ?`;
  values.push(id);

  const stmt = db.prepare(sql);
  const result = stmt.run(...values);
  return result > 0;
};