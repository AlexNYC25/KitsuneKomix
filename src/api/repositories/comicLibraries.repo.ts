import { getDatabase } from "../../config/db/sqliteConnection.ts";
import { LibraryRow, NewLibrary } from "../types/comicLibrary.type.ts";

function mapRowToLibrary(row: Record<string, unknown>): LibraryRow {
  return {
    id: row.id as number,
    name: row.name as string,
    description: row.description as string | null,
    path: row.path as string,
    enabled: row.enabled as boolean,
    changed_at: row.changed_at as string,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export const createComicLibrary = (library: NewLibrary): number => {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO comic_libraries (name, path, description, enabled)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(
    library.name,
    library.path,
    library.description,
    library.enabled ? 1 : 0,
  );
  const id = db.lastInsertRowId;
  return id;
};

export const getAllComicLibraries = (): LibraryRow[] => {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT id, name, path, description, enabled, changed_at, created_at, updated_at
    FROM comic_libraries
  `);
  const libraries = stmt.all();
  return libraries.map(mapRowToLibrary);
};

export const getComicLibraryById = (id: number): LibraryRow | undefined => {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT id, name, path, description, enabled, changed_at, created_at, updated_at
    FROM comic_libraries
    WHERE id = ?
  `);
  const library = stmt.get(id) as Record<string, unknown> | undefined;
  return library ? mapRowToLibrary(library) : undefined;
};

export const getComicLibraryLastChangedTime = (id: number): string | null => {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT changed_at
    FROM comic_libraries
    WHERE id = ?
  `);
  const result = stmt.get(id) as Record<string, unknown> | undefined;
  return result ? (result.changed_at as string) : null;
};

export const setComicLibraryChangedTime = (id: number): void => {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE comic_libraries
    SET changed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(id);
}

