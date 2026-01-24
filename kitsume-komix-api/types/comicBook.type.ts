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
}

export type ComicBookWithMetadata = ComicBook & ComicBookMetadataOnly;

import { QueryableColumns } from "../constants/index.ts";

export type AllowedFilterProperties = keyof typeof QueryableColumns["comics"]["filter"];

export type AllowedSortProperties = keyof typeof QueryableColumns["comics"]["sort"];

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

export type MultipleReturnResponseNoFilterNoSort = {
  data: ComicBook[] | ComicBookWithMetadata[];
  count: number;
  hasNextPage: boolean;
  currentPage: number;
  pageSize: number;
};