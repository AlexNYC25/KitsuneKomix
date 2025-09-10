import {
  ComicBook,
  ComicBookWithRelations,
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
  language?: string; // Note: corrected from schema typo
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
