/**
 * Interface representing the relationship between comic metadata and story arcs.
 * This interface is used to define the structure of the comic_metadata_story_arcs table in the database.
 * * @interface ComicMetadataStoryArc
 * @property {number | null} id - The unique identifier for the comic metadata story arc.
 * @property {number} metadata_id - The ID of the comic metadata this story arc is associated with.
 * @property {number} story_arc_id - The ID of the comic story arc this metadata is associated with.
 */
export interface ComicMetadataStoryArc {
  id: number | null; // Unique identifier for the comic metadata story arc, set after insertion
  metadata_id: number; // ID of the comic metadata this story arc is associated with
  story_arc_id: number; // ID of the comic story arc this metadata is associated with
}