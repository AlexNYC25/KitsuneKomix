// Re-export Drizzle-inferred types
export * from "./database.types.ts";

// ── Sort / Filter field types (simplified — no Zod dependency) ──
export type ComicSortField = string;
export type ComicFilterField = string;
export type ComicSeriesSortField = string;
export type ComicSeriesFilterField = string;
export type ComicSeriesGroupsSortField = string;
export type ComicSeriesGroupsFilterField = string;
export type ComicReadlistsSortField = string;
export type ComicReadlistsFilterField = string;

export type AllowedFilterProperties = ComicFilterField;

// ── Comic Book domain types ──
export type ComicBookFilterItem = {
  filterProperty: AllowedFilterProperties;
  filterValue: string;
};

export type ComicBookFilteringAndSortingParams = {
  filters?: ComicBookFilterItem[];
  sort?: {
    property: ComicSortField;
    order: "asc" | "desc";
  };
  offset?: number;
  limit?: number;
};

export type MetadataProcessor = {
  label: string;
  values?: string[];
  insert: (name: string) => Promise<number>;
  link: (entityId: number, comicId: number) => Promise<void>;
};

// ── Comic Series domain types ──
export type ComicSeriesFilterItem = {
  filterProperty: ComicSeriesFilterField;
  filterValue: string;
};

export type ComicSeriesFilteringAndSortingParams = {
  filters?: ComicSeriesFilterItem[];
  sort?: {
    property: ComicSeriesSortField;
    order: "asc" | "desc";
  };
  offset?: number;
  limit?: number;
};

// ── Comic Series Group domain types ──
export type ComicSeriesGroupsFilterItem = {
  filterProperty: ComicSeriesGroupsFilterField;
  filterValue: string;
};

export type ComicSeriesGroupsFilteringAndSortingParams = {
  filters?: ComicSeriesGroupsFilterItem[];
  sort?: {
    property: ComicSeriesGroupsSortField;
    order: "asc" | "desc";
  };
  offset?: number;
  limit?: number;
};

// ── Comic Story Arc (readlist) types ──
export type ComicStoryArcFilterItem = {
  filterProperty: ComicReadlistsFilterField;
  filterValue: string;
};

export type ComicStoryArcsFilteringAndSortingParams = {
  filters?: ComicStoryArcFilterItem[];
  sort?: {
    property: ComicReadlistsSortField;
    order: "asc" | "desc";
  };
  offset?: number;
  limit?: number;
};

export type ComicStoryArcWithComicIds = import("./database.types.ts").ComicStoryArc & { comicBookIds: number[] };

// ── Batch metadata types ──
export type ComicBookMetadata = {
  writers?: import("./database.types.ts").ComicWriter[];
  pencilers?: import("./database.types.ts").ComicPenciler[];
  inkers?: import("./database.types.ts").ComicInker[];
  letterers?: import("./database.types.ts").ComicLetterer[];
  editors?: import("./database.types.ts").ComicEditor[];
  colorists?: import("./database.types.ts").ComicColorist[];
  coverArtists?: import("./database.types.ts").ComicCoverArtist[];
  publishers?: import("./database.types.ts").ComicPublisher[];
  imprints?: import("./database.types.ts").ComicImprint[];
  genres?: import("./database.types.ts").ComicGenre[];
  characters?: import("./database.types.ts").ComicCharacter[];
  teams?: import("./database.types.ts").ComicTeam[];
  locations?: import("./database.types.ts").ComicLocation[];
  storyArcs?: import("./database.types.ts").ComicStoryArc[];
  seriesGroups?: import("./database.types.ts").ComicSeriesGroup[];
};

export type BatchMetadataResult = {
  [comicBookId: number]: ComicBookMetadata;
};

// ── Batch types ──
export type BatchComicBookHistory = Record<number, import("./database.types.ts").ComicBookHistory>;
export type BatchComicBookThumbnails = Record<number, import("./database.types.ts").ComicBookThumbnail[]>;

// ── Auth / Token types (plain interfaces) ──
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshToken {
  id: number;
  userId: number;
  tokenId: string;
  expiresAt: string;
  revoked: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRefreshTokenInput {
  userId: number;
  tokenId: string;
  expiresAt: string;
}

// ── User-edited fields (simplified — no Zod dependency) ──
export type UserEditInput = {
  email?: string;
  password?: string;
  admin?: boolean;
};

// ── Library input types (simplified — no Zod dependency) ──
export type LibraryRegistrationInput = {
  name: string;
  path: string;
  description?: string | null;
};

export type LibraryUpdateInput = {
  name?: string;
  path?: string;
  description?: string | null;
  enabled?: boolean;
};

// ── Comic extraction / parser types ──
export type ComicExtractionResult = {
  success: boolean;
  extractedPath: string;
  pageCount: number;
  pages: string[];
  coverImagePath?: string;
  fileSizeBytes: number;
  error?: string;
};

export type ThumbnailConfig = {
  width?: number;
  height?: number;
  quality?: number;
  preserveAspectRatio?: boolean;
  outputFormat?: "jpeg" | "png" | "webp";
};

export type ThumbnailResult = {
  success: boolean;
  thumbnailPath?: string;
  originalPath: string;
  error?: string;
  width?: number;
  height?: number;
  fileSize?: number;
};

export type ComicSeriesDetails = {
  series: string;
  volume?: string;
  count?: string;
  year?: string;
};

export type ComicFileDetails = ComicSeriesDetails & {
  issue: string;
};

export type StandardizedComicMetadataPage = {
  image: string;
  type: string;
  doublePage?: boolean;
  size?: number;
  width?: number;
  height?: number;
};

export type StandardizedComicMetadataReadingDirection =
  | "LeftToRight" | "RightToLeft" | "TopToBottom" | "BottomToTop";

export interface StandardizedComicMetadata {
  title?: string;
  series: string;
  issueNumber: string;
  volume?: string;
  count?: number;
  alternateSeries?: string;
  alternateNumber?: string;
  alternateCount?: number;
  pageCount?: number;
  summary?: string;
  notes?: string;
  year?: number;
  month?: number;
  day?: number;
  scanInfo?: string;
  language?: string;
  format?: string;
  blackAndWhite?: boolean;
  manga?: boolean;
  readingDirection?: StandardizedComicMetadataReadingDirection;
  review?: string;
  writers?: string[];
  pencilers?: string[];
  inkers?: string[];
  colorists?: string[];
  letterers?: string[];
  editors?: string[];
  coverArtists?: string[];
  publisher?: string[];
  imprint?: string[];
  genres?: string[];
  web?: string[];
  characters?: string[];
  teams?: string[];
  mainCharacterTeam?: string;
  locations?: string[];
  storyArcs?: string[];
  seriesGroups?: string[];
  ageRating?: string;
  communityRating?: number;
  pages?: StandardizedComicMetadataPage[];
}
