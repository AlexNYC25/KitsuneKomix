import {
  ComicBookPenciller,
  ComicBookWriter,
  NewComicBookPenciller,
  NewComicBookWriter,
} from "./database.types.ts";

// Re-export database types
export type {
  ComicBookPenciller,
  ComicBookWriter,
  NewComicBookPenciller,
  NewComicBookWriter,
};

// Junction table types for many-to-many relationships
export type ComicBookCreatorRelation = {
  comicBookId: number;
  creatorId: number;
  role:
    | "writer"
    | "penciller"
    | "inker"
    | "colorist"
    | "letterer"
    | "editor"
    | "cover";
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
