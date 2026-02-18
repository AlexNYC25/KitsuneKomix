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

import { ComicSortField } from "./parameters.type.ts";

export type ComicBookWithThumbnail = ComicBook & { thumbnailUrl?: string };

export type ComicBookMetadataOnly = {
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

export type ComicBookWithMetadata = ComicBook & ComicBookMetadataOnly;

import { QueryableColumns } from "../constants/index.ts";

export type AllowedFilterProperties =
  keyof typeof QueryableColumns["comics"]["filter"];

export type AllowedSortProperties =
  keyof typeof QueryableColumns["comics"]["sort"];

// Filter types for advanced comic book querying
export type ComicBookFilterItem = {
  filterProperty: AllowedFilterProperties;
  filterValue: string;
};

// Service function parameter types
export type ComicBookFilteringAndSortingParams = {
  filters?: ComicBookFilterItem[];
  sort?: {
    property: ComicSortField;
    order: "asc" | "desc";
  };
  offset?: number;
  limit?: number;
};

export type ComicBookStreamingServiceData = {
  comicId: number;
  pageNumber: number;
  acceptHeader: string | null;
  preloadPagesNumber: number;
};

export type ComicBookStreamingServiceResult = {
  comicId: number;
  pagePath: string;
  pageNumber: number;
  format: string;
  cached: boolean;
};
