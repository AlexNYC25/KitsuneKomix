import db from "../database.ts";
import { ComicMetadataInsert } from "../../interfaces/comic-metadata.interface.ts";

const INSERT_COMIC_BOOK_METADATA = `
  INSERT INTO comic_metadata (title, series, number, count, volume, alternate_series, alternate_number, alternate_volume, summary, notes, year, month, day, website, page_count, language, format, black_and_white, manga, scan_info, story_arc_id, community_rating, main_character, review, gtin)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
  RETURNING id
`;
/**
 * Inserts a new comic metadata record into the database.
 * @param {ComicMetadataInsert} metadata - The metadata of the comic to insert.
 * @throws Will throw an error if the insertion fails.
 * @returns {number} The ID of the newly inserted comic metadata.
 */
export function insertComicMetadataQuery(metadata: ComicMetadataInsert): number {
  const stmt = db.prepare(INSERT_COMIC_BOOK_METADATA);
  const row = stmt.get<{ id: number }>(
    metadata.title,
    metadata.series,
    metadata.number,
    metadata.count,
    metadata.volume,
    metadata.alternateSeries,
    metadata.alternateNumber,
    metadata.alternateVolume,
    metadata.summary,
    metadata.notes,
    metadata.year,
    metadata.month,
    metadata.day,
    metadata.website,
    metadata.page_count,
    metadata.language,
    metadata.format,
    metadata.blackAndWhite ? 1 : 0, // Convert boolean to integer
    metadata.manga ? 1 : 0, // Convert boolean to integer
    metadata.scanInfo,
    metadata.storyArcId ?? null, // Handle nullable field
    metadata.communityRating,
    metadata.mainCharacter,
    metadata.review,
    metadata.gtin
  );
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic metadata");
  return row.id;
}