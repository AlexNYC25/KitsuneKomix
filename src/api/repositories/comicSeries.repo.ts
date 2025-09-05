import { getDatabase } from "../../config/db/sqliteConnection.ts";
import { NewComicSeries, ComicSeriesRow } from "../types/comicSeries.type.ts";

function mapRowToComicSeries(row: Record<string, unknown>): ComicSeriesRow {
  return {
    id: row.id as number,
    name: row.name as string,
    description: row.description as string | null,
    folder_path: row.folder_path as string,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export const insertComicSeries = (seriesData: NewComicSeries): number => {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO comic_series (name, description, folder_path)
    VALUES (?, ?, ?)
  `);

  stmt.run(
    seriesData.name,
    seriesData.description ?? null,
    seriesData.folderPath ?? null,
  );

  const id = db.lastInsertRowId;
  return id;
};

export const getComicSeriesById = (id: number): ComicSeriesRow | undefined => {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM comic_series WHERE id = ?");
  const row = stmt.get(id) as Record<string, unknown> | undefined;
  return row ? mapRowToComicSeries(row) : undefined;
};

export const getComicSeriesByName = (name: string): ComicSeriesRow | undefined => {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM comic_series WHERE name = ?");
  const row = stmt.get(name) as Record<string, unknown> | undefined;
  return row ? mapRowToComicSeries(row) : undefined;
};

export const getComicSeriesByPath = (folderPath: string): ComicSeriesRow | undefined => {
	const db = getDatabase();
	const stmt = db.prepare("SELECT * FROM comic_series WHERE folder_path = ?");
	const row = stmt.get(folderPath) as Record<string, unknown> | undefined;
	return row ? mapRowToComicSeries(row) : undefined;
};

export const updateComicSeries = (id: number, updates: Partial<NewComicSeries>): boolean => {
  const db = getDatabase();
  const fields = [];
  const values = [];

  if (updates.name !== undefined) {
    fields.push("name = ?");
    values.push(updates.name);
  }

  if (updates.description !== undefined) {
    fields.push("description = ?");
    values.push(updates.description);
  }

  if (updates.folderPath !== undefined) {
    fields.push("folder_path = ?");
    values.push(updates.folderPath);
  }

  if (fields.length === 0) {
    return false;
  }

  const stmt = db.prepare(`
    UPDATE comic_series
    SET ${fields.join(", ")}
    WHERE id = ?
  `);

  stmt.run(...values, id);
  return true;
};
