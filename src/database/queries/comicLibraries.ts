import db from "../database.ts";

import { ComicLibrary } from "../../interfaces/comic-library.interface.ts";

export const GET_LIBRARIES = `
  SELECT 
    id, name, path, description, enabled, created_at, updated_at
  FROM comic_libraries
`;

export const GET_LIBRARY_BY_ID = `
  SELECT 
    id, name, path, description, enabled, created_at, updated_at
  FROM comic_libraries
  WHERE id = ?
`;

export const CREATE_LIBRARY = `
  INSERT INTO comic_libraries (name, path, description, enabled)
  VALUES (?, ?, ?, ?)
`;

export const UPDATE_LIBRARY = `
  UPDATE comic_libraries
  SET name = ?, path = ?, description = ?, enabled = ?, updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`;

export const DELETE_LIBRARY = `
  DELETE FROM comic_libraries
  WHERE id = ?
`;

export function getLibrariesQuery(): ComicLibrary[] {
  const stmt = db.prepare(GET_LIBRARIES);
  const rows = stmt.all() as Record<string, unknown>[];
  stmt.finalize();
  
  return rows.map(row => ({
    id: row.id as number,
    name: row.name as string,
    path: row.path as string,
    description: row.description as string | null,
    enabled: Boolean(row.enabled),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }));
}

export function getLibraryByIdQuery(id: number): ComicLibrary | null {
  const stmt = db.prepare(GET_LIBRARY_BY_ID);
  const row = stmt.get(id) as Record<string, unknown> | undefined;
  stmt.finalize();
  
  if (!row) return null;
  
  return {
    id: row.id as number,
    name: row.name as string,
    path: row.path as string,
    description: row.description as string | null,
    enabled: Boolean(row.enabled),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export function createLibraryQuery(
  name: string, 
  path: string, 
  description: string | null = null, 
  enabled: boolean = true
): number {
  const stmt = db.prepare(CREATE_LIBRARY);
  stmt.run(name, path, description, enabled ? 1 : 0);
  stmt.finalize();
  
  // Get the last inserted ID
  const idStmt = db.prepare("SELECT last_insert_rowid() as id");
  const { id } = idStmt.get() as { id: number };
  idStmt.finalize();
  
  return id;
}

export function updateLibraryQuery(
  id: number, 
  name: string, 
  path: string, 
  description: string | null = null,
  enabled: boolean = true
): void {
  const stmt = db.prepare(UPDATE_LIBRARY);
  stmt.run(name, path, description, enabled ? 1 : 0, id);
  stmt.finalize();
}

export function deleteLibraryQuery(id: number): void {
  const stmt = db.prepare(DELETE_LIBRARY);
  stmt.run(id);
  stmt.finalize();
}