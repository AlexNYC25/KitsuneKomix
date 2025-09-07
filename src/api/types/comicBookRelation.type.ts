import { 
  ComicBookWriter, 
  NewComicBookWriter,
  ComicBookPenciller,
  NewComicBookPenciller
} from "./database.types.ts";

// Re-export database types
export type { 
  ComicBookWriter, 
  NewComicBookWriter,
  ComicBookPenciller,
  NewComicBookPenciller
};

// Junction table types for many-to-many relationships
export type ComicBookCreatorRelation = {
  comicBookId: number;
  creatorId: number;
  role: 'writer' | 'penciller' | 'inker' | 'colorist' | 'letterer' | 'editor' | 'cover';
};

export type ComicBookWithCreators = {
  id: number;
  title: string;
  writers: string[];
  pencillers: string[];
  inkers?: string[];
  colorists?: string[];
  letterers?: string[];
  editors?: string[];
  coverArtists?: string[];
};
