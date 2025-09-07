import { 
  ComicWriter, 
  NewComicWriter, 
  ComicWriterWithBooks,
  ComicPenciller,
  NewComicPenciller,
  ComicPencillerWithBooks
} from "./database.types.ts";

// Re-export database types
export type { 
  ComicWriter, 
  NewComicWriter, 
  ComicWriterWithBooks,
  ComicPenciller,
  NewComicPenciller,
  ComicPencillerWithBooks
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
