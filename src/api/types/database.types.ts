import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  usersTable,
  appSettingsTable,
  comicLibrariesTable,
  comicBooksTable,
  comicSeriesTable,
  comicWritersTable,
  comicPencillersTable,
  comicBookWritersTable,
  comicBookPencillersTable,
} from "../db/sqlite/schema.ts";

// Inferred types from Drizzle schema
export type User = InferSelectModel<typeof usersTable>;
export type NewUser = InferInsertModel<typeof usersTable>;

export type AppSetting = InferSelectModel<typeof appSettingsTable>;
export type NewAppSetting = InferInsertModel<typeof appSettingsTable>;

export type ComicLibrary = InferSelectModel<typeof comicLibrariesTable>;
export type NewComicLibrary = InferInsertModel<typeof comicLibrariesTable>;

export type ComicBook = InferSelectModel<typeof comicBooksTable>;
export type NewComicBook = InferInsertModel<typeof comicBooksTable>;

export type ComicSeries = InferSelectModel<typeof comicSeriesTable>;
export type NewComicSeries = InferInsertModel<typeof comicSeriesTable>;

export type ComicWriter = InferSelectModel<typeof comicWritersTable>;
export type NewComicWriter = InferInsertModel<typeof comicWritersTable>;

export type ComicPenciller = InferSelectModel<typeof comicPencillersTable>;
export type NewComicPenciller = InferInsertModel<typeof comicPencillersTable>;

export type ComicBookWriter = InferSelectModel<typeof comicBookWritersTable>;
export type NewComicBookWriter = InferInsertModel<typeof comicBookWritersTable>;

export type ComicBookPenciller = InferSelectModel<typeof comicBookPencillersTable>;
export type NewComicBookPenciller = InferInsertModel<typeof comicBookPencillersTable>;

// Extended types with relationships
export type ComicBookWithRelations = ComicBook & {
  library?: ComicLibrary;
  writers?: ComicWriter[];
  pencillers?: ComicPenciller[];
  series?: ComicSeries;
};

export type ComicLibraryWithBooks = ComicLibrary & {
  books?: ComicBook[];
  bookCount?: number;
};

export type ComicSeriesWithBooks = ComicSeries & {
  books?: ComicBook[];
  bookCount?: number;
};

export type ComicWriterWithBooks = ComicWriter & {
  books?: ComicBook[];
  bookCount?: number;
};

export type ComicPencillerWithBooks = ComicPenciller & {
  books?: ComicBook[];
  bookCount?: number;
};
