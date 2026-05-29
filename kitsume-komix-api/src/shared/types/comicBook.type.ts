import { SetIntersection } from 'utility-types';

import type {
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
  ComicPenciler,
  ComicPublisher,
  ComicSeriesGroup,
  ComicStoryArc,
  ComicTeam,
  ComicWriter,
} from "./database.types.ts";

import type { ComicSortField } from "./parameters.type.ts";

export type ComicBookWithThumbnail = ComicBook & { thumbnailUrl?: string };

import type { QueryableColumns } from "#infrastructure/db/sqlite/queryableColumns.ts";

export type AllowedFilterProperties =
  keyof typeof QueryableColumns["comics"]["filter"];

export type AllowedSortProperties =
  keyof typeof QueryableColumns["comics"]["sort"];

export type ComicBookMetadataOnly = {
  writers?: ComicWriter[];
  pencilers?: ComicPenciler[];
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

export type ComicBookLevelMetadata = {
  letters?: string[];
  years?: number[];
  languages?: string[];
  formats?: string[];
  readingDirections?: string[];
  ageRatings?: string[];
  libraryIds?: number[];
  manga?: number[];
  blackAndWhite?: number[];
  seriesNames?: string[];
}

export type ComicBooksFilterValues = ComicBookMetadataOnly & ComicBookLevelMetadata;

export type ComicBookWithMetadata = ComicBookWithThumbnail & ComicBookMetadataOnly;

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

/**
 * Type representing the an internal structure of data
 * when processing comic metadata
 */
export type MetadataProcessor = {
	label: string;
	values?: string[];
	insert: (name: string) => Promise<number>;
	link: (entityId: number, comicId: number) => Promise<void>;
};