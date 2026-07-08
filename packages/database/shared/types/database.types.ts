import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type {
  appSettingsTable,
  usersTable,
  refreshTokensTable,
  comicLibrariesTable,
  userComicLibrariesTable,
  comicSeriesTable,
  comicLibrariesSeriesTable,
  comicBooksTable,
  comicBookStoryArcsTable,
  comicSeriesGroupsTable,
  comicSeriesBooksTable,
  comicPagesTable,
  comicBookCoversTable,
  comicBookThumbnailsTable,
  comicBookHistoryTable,
  comicContentTable,
  comicCreditsTable,
  comicBookContentsTable,
  comicBookCreditsTable,
  comicGenresTable,
  comicPublishersTable,
  comicSeriesGenresAggregateTable,
  comicSeriesPublishersAggregateTable,
  comicWebLinksTable,
  comicBookIngestionTable,
  comicMetadataCandidatesTable
} from "../../schemas/index.ts";

export type AppSetting = InferSelectModel<typeof appSettingsTable>;
export type NewAppSetting = InferInsertModel<typeof appSettingsTable>;

export type User = typeof usersTable.$inferSelect;
export type NewUser = InferInsertModel<typeof usersTable>;

export type RefreshToken = InferSelectModel<typeof refreshTokensTable>;
export type NewRefreshToken = InferInsertModel<typeof refreshTokensTable>;

export type ComicLibrary = InferSelectModel<typeof comicLibrariesTable>;
export type NewComicLibrary = InferInsertModel<typeof comicLibrariesTable>;

export type UserComicLibrary = InferSelectModel<typeof userComicLibrariesTable>;
export type NewUserComicLibrary = InferInsertModel<typeof userComicLibrariesTable>;

export type ComicSeries = typeof comicSeriesTable.$inferSelect;
export type NewComicSeries = InferInsertModel<typeof comicSeriesTable>;

export type ComicLibrarySeries = InferSelectModel<typeof comicLibrariesSeriesTable>;
export type NewComicLibrarySeries = InferInsertModel<typeof comicLibrariesSeriesTable>;

export type ComicBook = InferSelectModel<typeof comicBooksTable>;
export type NewComicBook = InferInsertModel<typeof comicBooksTable>;

export type ComicSeriesBook = InferSelectModel<typeof comicSeriesBooksTable>;
export type NewComicSeriesBook = InferInsertModel<typeof comicSeriesBooksTable>;

export type ComicSeriesGroup = InferSelectModel<typeof comicSeriesGroupsTable>;
export type NewComicSeriesGroup = InferInsertModel<typeof comicSeriesGroupsTable>;

export type ComicBookStoryArc = InferSelectModel<typeof comicBookStoryArcsTable>;
export type NewComicBookStoryArc = InferInsertModel<typeof comicBookStoryArcsTable>;

export type ComicPage = InferSelectModel<typeof comicPagesTable>;
export type NewComicPage = InferInsertModel<typeof comicPagesTable>;

export type ComicBookCover = InferSelectModel<typeof comicBookCoversTable>;
export type NewComicBookCover = InferInsertModel<typeof comicBookCoversTable>;

export type ComicBookThumbnail = InferSelectModel<typeof comicBookThumbnailsTable>;
export type NewComicBookThumbnail = InferInsertModel<typeof comicBookThumbnailsTable>;

export type ComicBookHistory = InferSelectModel<typeof comicBookHistoryTable>;
export type NewComicBookHistory = InferInsertModel<typeof comicBookHistoryTable>;

export type ComicContent = InferSelectModel<typeof comicContentTable>;
export type NewComicContent = InferInsertModel<typeof comicContentTable>;

export type ComicCredit = InferSelectModel<typeof comicCreditsTable>;
export type NewComicCredit = InferInsertModel<typeof comicCreditsTable>;

export type ComicBookContent = InferSelectModel<typeof comicBookContentsTable>;
export type NewComicBookContent = InferInsertModel<typeof comicBookContentsTable>;

export type ComicBookCredit = InferSelectModel<typeof comicBookCreditsTable>;
export type NewComicBookCredit = InferInsertModel<typeof comicBookCreditsTable>;

export type ComicGenre = InferSelectModel<typeof comicGenresTable>;
export type NewComicGenre = InferInsertModel<typeof comicGenresTable>;

export type ComicPublisher = InferSelectModel<typeof comicPublishersTable>;
export type NewComicPublisher = InferInsertModel<typeof comicPublishersTable>;

export type ComicSeriesGenreAggregate = InferSelectModel<typeof comicSeriesGenresAggregateTable>;
export type NewComicSeriesGenreAggregate = InferInsertModel<typeof comicSeriesGenresAggregateTable>;

export type ComicSeriesPublisherAggregate = InferSelectModel<typeof comicSeriesPublishersAggregateTable>;
export type NewComicSeriesPublisherAggregate = InferInsertModel<typeof comicSeriesPublishersAggregateTable>;

export type ComicWebLink = InferSelectModel<typeof comicWebLinksTable>;
export type NewComicWebLink = InferInsertModel<typeof comicWebLinksTable>;

export type ComicBookIngestion = InferSelectModel<typeof comicBookIngestionTable>;
export type NewComicBookIngestion = InferInsertModel<typeof comicBookIngestionTable>;

export type ComicMetadataCandidate = InferSelectModel<typeof comicMetadataCandidatesTable>;
export type NewComicMetadataCandidate = InferInsertModel<typeof comicMetadataCandidatesTable>;
