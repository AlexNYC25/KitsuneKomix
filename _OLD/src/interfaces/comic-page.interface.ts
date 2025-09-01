
/**
 * ComicPage Interface
 * This interface defines the structure of a comic page in the database.
 * It is used to store information about each page of a comic book.
 * @interface ComicPage
 * @property {number | null} id - The unique identifier for the comic page, set after insertion.
 * @property {number} metadata_id - Foreign key referencing the comic metadata.
 * @property {number} page_number - The page number of the comic page, required field.
 * @property {boolean | null} double_page - Indicates if the page is a double page spread.
 * @property {number} image_size - Size of the image in bytes, required field.
 * @property {string} image_path - Path to the image file, required field.
 * @property {boolean} key_image - Indicates if this is the key image for the comic.
 * @property {number} image_width - Width of the image in pixels, required field.
 * @property {number} image_height - Height of the image in pixels, required field.
 * @property {string} image_hash - Hash of the image for integrity checks, required field.
 * @property {number} page_type_id - Foreign key referencing the page type
 */
export interface ComicPage {
    id: number | null; // Unique identifier for the comic page, set after insertion
    metadata_id: number | null; // Foreign key referencing the comic metadata
    page_number: number; // Page number of the comic page, required field
    double_page: boolean | null; // Indicates if the page is a double page spread
    image_size: number; // Size of the image in bytes, required field
    image_path: string | null; // Path to the image file, required field
    key_image: boolean; // Indicates if this is the key image for the comic
    image_width: number; // Width of the image in pixels, required field
    image_height: number; // Height of the image in pixels, required field
    image_hash: string; // Hash of the image for integrity checks, required field
    page_type_id: number | null; // Foreign key referencing the page type
}
