-- This migration script creates indexes for hash values in the comic_books and comic_pages tables
-- so that we can efficiently compare and query these values.
CREATE INDEX IF NOT EXISTS idx_comic_books_file_hash ON comic_books(file_hash);

CREATE INDEX IF NOT EXISTS idx_comic_pages_image_hash ON comic_pages(image_hash);