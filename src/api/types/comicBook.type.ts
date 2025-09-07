import { ComicBook, NewComicBook, ComicBookWithRelations } from "./database.types.ts";

// Re-export database types
export type { ComicBook, NewComicBook, ComicBookWithRelations };

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
  volume?: string;
  publisher?: string;
  publicationDate?: string;
  tags?: string[]; // Parse from comma-separated string
  read: boolean;
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

export type ComicBookUpdate = Partial<Omit<ComicBookInput, 'filePath' | 'hash' | 'libraryId'>>;

export type ComicBookSearchParams = {
  title?: string;
  series?: string;
  publisher?: string;
  tags?: string[];
  libraryId?: number;
  read?: boolean;
};