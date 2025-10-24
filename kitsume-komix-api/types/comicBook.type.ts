import {
  ComicBook,
  ComicBookWithRelations,
  ComicCharacter,
  ComicColorist,
  ComicCoverArtist,
  ComicEditor,
  ComicGenre,
  ComicImprint,
  ComicInker,
  ComicLetterer,
  ComicLocation,
  ComicPenciller,
  ComicPublisher,
  ComicSeriesGroup,
  ComicStoryArc,
  ComicTeam,
  ComicWriter,
  NewComicBook,
} from "./database.types.ts";

// Re-export database types
export type { ComicBook, ComicBookWithRelations, NewComicBook };

// Legacy types for backward compatibility
export type ComicBookRow = ComicBook;

export type ComicBookDomain = {
  id: number;
  libraryId: number;
  filePath: string;
  hash: string;
  title?: string;
  series?: string;
  issueNumber?: string;
  count?: number;
  volume?: string;
  alternateSeries?: string;
  alternateIssueNumber?: string;
  alternateCount?: number;
  pageCount?: number;
  summary?: string;
  notes?: string;
  year?: number;
  month?: number;
  day?: number;
  publisher?: string;
  publicationDate?: string;
  scanInfo?: string;
  language?: string | null; // Note: corrected from schema typo
  format?: string;
  blackAndWhite?: boolean;
  manga?: boolean;
  readingDirection?: string;
  review?: string;
  ageRating?: string;
  communityRating?: number;
  createdAt: string;
  updatedAt: string;
};

export type ComicBookInput = {
  title: string;
  issueNumber?: string;
  volume?: string;
  series?: string;
  publisher?: string;
  tags?: string[]; // Array of tags
  filePath: string;
  hash: string;
  metadata?: Record<string, unknown>; // Additional metadata
  publicationDate?: string;
  libraryId: number;
};

export type ComicBookUpdate = Partial<
  Omit<ComicBookInput, "filePath" | "hash" | "libraryId">
>;

export type ComicBookSearchParams = {
  title?: string;
  series?: string;
  publisher?: string;
  tags?: string[];
  libraryId?: number;
  read?: boolean;
};

export type ComicBookWithMetadata = ComicBook & {
  writers?: ComicWriter[];
  pencillers?: ComicPenciller[];
  inkers?: ComicInker[];
  letterers?: ComicLetterer[];
  editors?: ComicEditor[];
  colorists?: ComicColorist[];
  coverArtists?: ComicCoverArtist[];
  publishers?: ComicPublisher[];
  imprints?: ComicImprint[];
  genres?: ComicGenre[];
  characters?: ComicCharacter[];
  teams?: ComicTeam[];
  locations?: ComicLocation[];
  storyArcs?: ComicStoryArc[];
  seriesGroups?: ComicSeriesGroup[];
};

// Request parameter types for service layer
export type RequestPaginationParameters = {
  page?: number;
  pageSize?: number;
};

export type RequestSortParameters = {
  sort?: string;
  sortProperty?: string;
  sortOrder?: "asc" | "desc";
};

export type RequestFilterParameters = {
  filter?: string;
  filterProperty?: string;
};

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

export type AllowedFilterProperties = 
  typeof COMIC_BOOK_INTERNAL_METADATA_PROPERTIES[number] | 
  typeof COMIC_BOOK_EXTERNAL_METADATA_PROPERTIES[number];

export type ExternalFilterProperties = typeof COMIC_BOOK_EXTERNAL_METADATA_PROPERTIES[number];

export type AllowedSortProperties = 
  typeof COMIC_BOOK_INTERNAL_METADATA_PROPERTIES[number] | 
  typeof COMIC_BOOK_EXTERNAL_METADATA_PROPERTIES[number];

// Filter types for advanced comic book querying
export type ComicBookFilterItem = {
  filterProperty: AllowedFilterProperties;
  filterValue: string;
};

export type ComicBookExternalFilterItem = {
  filterProperty: ExternalFilterProperties;
  filterIds: number[];
};

export type ComicBookFiltersCheckList = {
  [key in ExternalFilterProperties]?: boolean;
};

export type ComicBookFiltersIdMap = {
  [key in ExternalFilterProperties]?: number[];
};

// Service function parameter types
export type ComicBookFilteringAndSortingParams = {
  internalFilters?: ComicBookFilterItem[];
  externalFilters?: ComicBookExternalFilterItem[];
  sort?: {
    property: AllowedSortProperties;
    order: "asc" | "desc";
  };
  offset?: number;
  limit?: number;
};
