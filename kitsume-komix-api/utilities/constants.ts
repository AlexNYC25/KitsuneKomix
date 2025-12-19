
// Default pagination settings
export const PAGE_SIZE_DEFAULT = 20;
export const PAGE_NUMBER_DEFAULT = 1;

export const FILTER_SORT_DEFAULT = "asc";

// Metadata properties constants and types
export const COMIC_BOOK_INTERNAL_METADATA_PROPERTIES = [
  "id",
  "title",
  "issue_number",
  "volume",
  "summary",
  "series",
  "alternate_series",
  "alternate_issue_number",
  "alternate_volume",
  "publication_date",
  "created_at",
  "updated_at",
] as const;

export const COMIC_BOOK_EXTERNAL_METADATA_PROPERTIES = [
  "characters",
  "colorists",
  "cover_artists",
  "editors",
  "genres",
  "imprints",
  "inkers",
  "letterers",
  "locations",
  "pencillers",
  "publishers",
  "story_arcs",
  "teams",
  "writers",
] as const;