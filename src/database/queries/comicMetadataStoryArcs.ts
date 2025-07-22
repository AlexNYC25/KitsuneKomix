import db from "../database.ts";

export const INSERT_COMIC_METADATA_STORY_ARC = `
  INSERT INTO comic_metadata_story_arcs (metadata_id, story_arc_id)
    VALUES (?, ?)
    ON CONFLICT(metadata_id, story_arc_id)
    DO NOTHING
    RETURNING id
`;

/**
 * Inserts a comic metadata story arc into the database.
 * @param {number} comicMetadataId The ID of the comic metadata.
 * @param {number} storyArcId The ID of the story arc.
 * @returns {number} The ID of the inserted comic metadata story arc.
 * @throws {Error} If the insertion fails.
 */
export function insertComicMetadataStoryArcQuery(comicMetadataId: number, storyArcId: number): number {
  const stmt = db.prepare(INSERT_COMIC_METADATA_STORY_ARC);
  const row = stmt.get<{ id: number }>(comicMetadataId, storyArcId);
  stmt.finalize();

  if (!row) throw new Error("Failed to insert comic metadata story arc");

  return row.id;
}