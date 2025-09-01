
/**
 * ComicContent Interface
 * This interface defines the structure of comic content in the database.
 * It is used for various types of comic content such as characters, locations, and teams
 * used with comic_characters, comic_locations, comic_teams,
 */
export interface ComicContent {
    id: number | null; // Unique identifier for the comic content, set after insertion
    name: string; // Name of the comic content, required field
    description?: string; // Optional description of the comic content
}