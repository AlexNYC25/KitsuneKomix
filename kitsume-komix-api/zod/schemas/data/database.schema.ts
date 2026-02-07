import { createSelectSchema } from "../../factory.ts";
import {
  appSettingsTable,
  comicBookCharactersTable,
  comicBookColoristsTable,
  comicBookCoverArtistsTable,
  comicBookEditorsTable,
  comicBookGenresTable,
  comicBookHistoryTable,
  comicBookImprintsTable,
  comicBookInkersTable,
  comicBookLetterersTable,
  comicBookLocationsTable,
  comicBookPencillersTable,
  comicBookPublishersTable,
  comicBookSeriesGroupsTable,
  comicBooksTable,
  comicBookStoryArcsTable,
  comicBookTeamsTable,
  comicBookThumbnailsTable,
  comicBookWritersTable,
  comicCharactersTable,
  comicColoristsTable,
  comicCoverArtistsTable,
  comicEditorsTable,
  comicGenresTable,
  comicImprintsTable,
  comicInkersTable,
  comicLetterersTable,
  comicLibrariesTable,
  comicLocationsTable,
  comicPagesTable,
  comicPencillersTable,
  comicPublishersTable,
  comicSeriesGroupsTable,
  comicSeriesTable,
  comicStoryArcsTable,
  comicTeamsTable,
  comicWritersTable,
  usersTable,
} from "#sqlite/schema.ts";

// Inferred schemas from Drizzle schema
export const UserSelectSchema = createSelectSchema(usersTable);

export const AppSettingSelectSchema = createSelectSchema(appSettingsTable);

export const ComicLibrarySelectSchema = createSelectSchema(comicLibrariesTable);

export const ComicBookSelectSchema = createSelectSchema(comicBooksTable);

export const ComicBookHistorySelectSchema = createSelectSchema(
  comicBookHistoryTable,
);

export const ComicBookThumbnailSelectSchema = createSelectSchema(
  comicBookThumbnailsTable,
);

export const ComicBookCharacterSelectSchema = createSelectSchema(
  comicBookCharactersTable,
);

export const ComicBookColoristSelectSchema = createSelectSchema(
  comicBookColoristsTable,
);

export const ComicBookCoverArtistSelectSchema = createSelectSchema(
  comicBookCoverArtistsTable,
);

export const ComicBookEditorSelectSchema = createSelectSchema(
  comicBookEditorsTable,
);

export const ComicBookGenreSelectSchema = createSelectSchema(
  comicBookGenresTable,
);

export const ComicBookImprintSelectSchema = createSelectSchema(
  comicBookImprintsTable,
);

export const ComicBookInkerSelectSchema = createSelectSchema(
  comicBookInkersTable,
);

export const ComicBookLettererSelectSchema = createSelectSchema(
  comicBookLetterersTable,
);

export const ComicBookLocationSelectSchema = createSelectSchema(
  comicBookLocationsTable,
);

export const ComicBookPencillerSelectSchema = createSelectSchema(
  comicBookPencillersTable,
);

export const ComicBookPublisherSelectSchema = createSelectSchema(
  comicBookPublishersTable,
);

export const ComicBookSeriesGroupSelectSchema = createSelectSchema(
  comicBookSeriesGroupsTable,
);

export const ComicBookStoryArcSelectSchema = createSelectSchema(
  comicBookStoryArcsTable,
);

export const ComicBookTeamSelectSchema = createSelectSchema(
  comicBookTeamsTable,
);

export const ComicBookWriterSelectSchema = createSelectSchema(
  comicBookWritersTable,
);

export const ComicCharacterSelectSchema = createSelectSchema(
  comicCharactersTable,
);

export const ComicColoristSelectSchema = createSelectSchema(
  comicColoristsTable,
);

export const ComicCoverArtistSelectSchema = createSelectSchema(
  comicCoverArtistsTable,
);

export const ComicEditorSelectSchema = createSelectSchema(
  comicEditorsTable,
);

export const ComicGenreSelectSchema = createSelectSchema(
  comicGenresTable,
);

export const ComicImprintSelectSchema = createSelectSchema(
  comicImprintsTable,
);

export const ComicInkerSelectSchema = createSelectSchema(
  comicInkersTable,
);

export const ComicLettererSelectSchema = createSelectSchema(
  comicLetterersTable,
);

export const ComicLocationSelectSchema = createSelectSchema(
  comicLocationsTable,
);

export const ComicPageSelectSchema = createSelectSchema(
  comicPagesTable,
);

export const ComicPencillerSelectSchema = createSelectSchema(
  comicPencillersTable,
);

export const ComicPublisherSelectSchema = createSelectSchema(
  comicPublishersTable,
);

export const ComicSeriesGroupSelectSchema = createSelectSchema(
  comicSeriesGroupsTable,
);

export const ComicSeriesSelectSchema = createSelectSchema(
  comicSeriesTable,
);

export const ComicStoryArcSelectSchema = createSelectSchema(
  comicStoryArcsTable,
);

export const ComicTeamSelectSchema = createSelectSchema(
  comicTeamsTable,
);

export const ComicWriterSelectSchema = createSelectSchema(
  comicWritersTable,
);