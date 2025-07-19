
/**
 * Interface representing a comic story arc.
 * This interface defines the structure of a comic story arc in the database.
 * * @interface ComicStoryArc
 * @property {number | null} id - The unique identifier for the comic story arc.
 * @property {string} title - The title of the story arc, required field.
 * @property {string} [description] - Optional description of the story arc.
 */
export interface ComicStoryArc {
    id: number | null; // Unique identifier for the comic story arc, set after insertion
    title: string; // Title of the story arc, required field
    description?: string; // Optional description of the story arc
}