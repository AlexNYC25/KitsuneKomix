import { Database } from "@db/sqlite";

import logger from '../utilities/logger.ts';
import {
  createAppTasksTable,
  createAppSettingsTable,
  createComicsTable,
  createComicBookStoryArcsTable,
  createComicMetadataTable,
  createComicSeriesTable,
  createComicBookSeriesGroupsTable,
  createComicBookPencillersTable,
  createComicBookWritersTable,
  createComicBookInkersTable,
  createComicBookColoristsTable,
  createComicBookLetterersTable,
  createComicBookCoverArtistsTable,
  createComicBookEditorsTable,
  createComicBookPublishersTable,
  createComicBookImprintsTable,
  createComicBookGenresTable,
  createComicBookTranslatorsTable,
  createComicBookTagsTable,
  createComicBookCharactersTable,
  createComicBookLocationsTable,
  createComicBookTeamsTable,
  createComicBookAgeRatingsTable,
  createComicBookPageTypesTable,
  createComicBookPagesTable,
  createComicBookMetadataPencillersTable,
  createComicBookMetadataWritersTable,
  createComicBookMetadataInkersTable,
  createComicBookMetadataColoristsTable,
  createComicBookMetadataLetterersTable,
  createComicBookMetadataCoverArtistsTable,
  createComicBookMetadataEditorsTable,
  createComicBookMetadataTranslatorsTable,
  createComicBookMetadataPublishersTable,
  createComicBookMetadataImprintsTable,
  createComicBookMetadataGenresTable,
  createComicBookMetadataTagsTable,
  createComicBookMetadataCharactersTable,
  createComicBookMetadataLocationsTable,
  createComicBookMetadataTeamsTable,
  createComicBookMetadataStoryArcsTable,
  createComicBookMetadataSeriesGroupsTable,
  createComicBookMetadataAgeRatingsTable,
  createComicBookMetadataPagesTable,
} from './schemaDefinitions.ts';
import { seedDatabase } from './seed.ts';

/**
 * Initializes the database schema by creating necessary tables and seeding initial data.
 * This function should be called once when the application starts to ensure the database is ready for use.
 * 
 * @param {Database} db - The SQLite database instance to initialize.
 */
export function initializeSchema(db: Database): void {
  logger.info('Initializing Schema... Running schema setup...');
  // The order of the queries is important, as some tables depend on others depending on foreign keys.
  db.exec(
  [
    createAppTasksTable,
    createAppSettingsTable,
    createComicBookStoryArcsTable,
    createComicMetadataTable,
    createComicSeriesTable,
    createComicsTable,
    createComicBookSeriesGroupsTable,
    createComicBookPencillersTable,
    createComicBookWritersTable,
    createComicBookInkersTable,
    createComicBookColoristsTable,
    createComicBookLetterersTable,
    createComicBookCoverArtistsTable,
    createComicBookEditorsTable,
    createComicBookPublishersTable,
    createComicBookImprintsTable,
    createComicBookGenresTable,
    createComicBookTranslatorsTable,
    createComicBookTagsTable,
    createComicBookCharactersTable,
    createComicBookLocationsTable,
    createComicBookTeamsTable,
    createComicBookAgeRatingsTable,
    createComicBookPageTypesTable,
    createComicBookPagesTable,
    createComicBookMetadataPencillersTable,
    createComicBookMetadataWritersTable,
    createComicBookMetadataInkersTable,
    createComicBookMetadataColoristsTable,
    createComicBookMetadataLetterersTable,
    createComicBookMetadataCoverArtistsTable,
    createComicBookMetadataEditorsTable,
    createComicBookMetadataTranslatorsTable,
    createComicBookMetadataPublishersTable,
    createComicBookMetadataImprintsTable,
    createComicBookMetadataGenresTable,
    createComicBookMetadataTagsTable,
    createComicBookMetadataCharactersTable,
    createComicBookMetadataLocationsTable,
    createComicBookMetadataTeamsTable,
    createComicBookMetadataStoryArcsTable,
    createComicBookMetadataSeriesGroupsTable,
    createComicBookMetadataAgeRatingsTable,
    createComicBookMetadataPagesTable,
  ].join('\n\n')
  );
  logger.info('Initializing Schema... Schema initialized (tables created if missing).');

  logger.info('Initializing Schema... Seeding initial data...');
  seedDatabase(db);
  logger.info('Initializing Schema... Database seeding completed.');
}
