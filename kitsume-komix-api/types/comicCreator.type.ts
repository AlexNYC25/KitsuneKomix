import {
  ComicPenciller,
  ComicPencillerWithBooks,
  ComicWriter,
  ComicWriterWithBooks,
  NewComicPenciller,
  NewComicWriter,
} from "./database.types.ts";

// Re-export database types
export type {
  ComicPenciller,
  ComicPencillerWithBooks,
  ComicWriter,
  ComicWriterWithBooks,
  NewComicPenciller,
  NewComicWriter,
};

export type ComicCreatorInput = {
  name: string;
  description?: string;
};

export type ComicCreatorUpdate = {
  name?: string;
  description?: string;
};

export type ComicCreatorSearchParams = {
  name?: string;
};
