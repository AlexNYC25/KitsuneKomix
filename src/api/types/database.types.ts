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
  comicBookInkersTable,
  comicBookColoristsTable,
  comicBookLetterersTable,
  comicBookEditorsTable,
  comicBookCoverArtistsTable,
  comicBookPublishersTable,
  comicBookImprintsTable,
  comicBookGenresTable,
  comicBookCharactersTable,
  comicBookLocationsTable,
  comicBookTeamsTable,
  comicBookStoryArcsTable,
  comicBookSeriesGroupsTable,
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

export type ComicBookInker = InferSelectModel<typeof comicBookInkersTable>;
export type NewComicBookInker = InferInsertModel<typeof comicBookInkersTable>;

export type ComicBookColorist = InferSelectModel<typeof comicBookColoristsTable>;
export type NewComicBookColorist = InferInsertModel<typeof comicBookColoristsTable>;

export type ComicBookLetterer = InferSelectModel<typeof comicBookLetterersTable>;
export type NewComicBookLetterer = InferInsertModel<typeof comicBookLetterersTable>;

export type ComicBookEditor = InferSelectModel<typeof comicBookEditorsTable>;
export type NewComicBookEditor = InferInsertModel<typeof comicBookEditorsTable>;

export type ComicBookCoverArtist = InferSelectModel<typeof comicBookCoverArtistsTable>;
export type NewComicBookCoverArtist = InferInsertModel<typeof comicBookCoverArtistsTable>;

export type ComicBookPublisher = InferSelectModel<typeof comicBookPublishersTable>;
export type NewComicBookPublisher = InferInsertModel<typeof comicBookPublishersTable>;

export type ComicBookImprint = InferSelectModel<typeof comicBookImprintsTable>;
export type NewComicBookImprint = InferInsertModel<typeof comicBookImprintsTable>;

export type ComicBookGenre = InferSelectModel<typeof comicBookGenresTable>;
export type NewComicBookGenre = InferInsertModel<typeof comicBookGenresTable>;

export type ComicBookCharacter = InferSelectModel<typeof comicBookCharactersTable>;
export type NewComicBookCharacter = InferInsertModel<typeof comicBookCharactersTable>;

export type ComicBookLocation = InferSelectModel<typeof comicBookLocationsTable>;
export type NewComicBookLocation = InferInsertModel<typeof comicBookLocationsTable>;

export type ComicBookTeam = InferSelectModel<typeof comicBookTeamsTable>;
export type NewComicBookTeam = InferInsertModel<typeof comicBookTeamsTable>;

export type ComicBookStoryArc = InferSelectModel<typeof comicBookStoryArcsTable>;
export type NewComicBookStoryArc = InferInsertModel<typeof comicBookStoryArcsTable>;

export type ComicBookSeriesGroup = InferSelectModel<typeof comicBookSeriesGroupsTable>;
export type NewComicBookSeriesGroup = InferInsertModel<typeof comicBookSeriesGroupsTable>;

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
