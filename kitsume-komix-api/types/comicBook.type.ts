import {
  ComicBook,
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
} from "./database.types.ts";

export type ComicBookWithThumbnail = ComicBook & { thumbnailUrl?: string };

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
  | typeof COMIC_BOOK_INTERNAL_METADATA_PROPERTIES[number]
  | typeof COMIC_BOOK_EXTERNAL_METADATA_PROPERTIES[number];

export type ExternalFilterProperties =
  typeof COMIC_BOOK_EXTERNAL_METADATA_PROPERTIES[number];

export type AllowedSortProperties =
  | typeof COMIC_BOOK_INTERNAL_METADATA_PROPERTIES[number]
  | typeof COMIC_BOOK_EXTERNAL_METADATA_PROPERTIES[number];

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

// Response contract for routes that return lists of comic books
export type MultipleReturnResponse = {
  data: ComicBook[] | ComicBookWithMetadata[];
  count: number;
  hasNextPage: boolean;
  currentPage: number;
  pageSize: number;
  filter: string | null;
  filterProperty: string | null;
  sort: string | null;
  sortProperty: string | null;
  sortOrder?: string | null;
};
