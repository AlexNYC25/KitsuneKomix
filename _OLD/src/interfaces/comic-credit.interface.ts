
/**
 * Interface representing a comic credit.
 * This interface defines the structure of a comic credit in the database.
 * Used for comic_pencilers, comic_inkers, comic_colorists, comic_letterers, and comic_editors and comic_cover_artists,
 * comic_publishers, comic_imprints, comic_translators, comic_genre, comic_tags
 * @interface ComicCredit
 * @property {number | null} id - The unique identifier for the comic credit.
 * @property {string} name - The name of the credit, required field.
 */
export interface ComicCredit {
    id: number | null; // Unique identifier for the comic credit, set after insertion
    name: string; // Name of the credit, required field
}