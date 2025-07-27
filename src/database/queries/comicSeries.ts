import db from "../database.ts";
import { ComicSeriesInsert } from "../../interfaces/comic-series.interface.ts";

export const INSERT_COMIC_SERIES =
	`INSERT INTO comic_series
    	(name, folder_path, description, publisher, start_year, end_year, total_issues, library_id)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	ON CONFLICT(folder_path)
		DO UPDATE SET name = excluded.name
	RETURNING id;
`;

/**
 * Inserts a new comic series or updates an existing one.
 * @param {ComicSeriesInsert} series - The comic series data to insert or update.
 * @throws Will throw an error if the insertion or upsert fails.
 * @returns {number} The ID of the inserted or updated comic series.
 */
export function insertComicSeriesQuery(series: ComicSeriesInsert): number {
	const stmt = db.prepare(INSERT_COMIC_SERIES);
	const row = stmt.get<{ id: number }>(
		series.name,
		series.folder_path,
		series.description,
		series.publisher,
		series.start_year,
		series.end_year,
		series.total_issues,
		series.library_id
	);
	stmt.finalize();
	if (!row) throw new Error("Failed to insert or upsert comic series");
	return row.id;
}
