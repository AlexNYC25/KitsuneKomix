import { getClient } from "../client.ts";
import { inArray, eq } from "drizzle-orm";
import {
  comicBookWritersTable,
  comicWritersTable,
  comicBookPencilersTable,
  comicPencilersTable,
  comicBookInkersTable,
  comicInkersTable,
  comicBookLetterersTable,
  comicLetterersTable,
  comicBookEditorsTable,
  comicEditorsTable,
  comicBookColoristsTable,
  comicColoristsTable,
  comicBookCoverArtistsTable,
  comicCoverArtistsTable,
  comicBookPublishersTable,
  comicPublishersTable,
  comicBookImprintsTable,
  comicImprintsTable,
  comicBookGenresTable,
  comicGenresTable,
  comicBookCharactersTable,
  comicCharactersTable,
  comicBookTeamsTable,
  comicTeamsTable,
  comicBookLocationsTable,
  comicLocationsTable,
  comicBookStoryArcsTable,
  comicStoryArcsTable,
  comicBookSeriesGroupsTable,
  comicSeriesGroupsTable,
} from "#infrastructure/db/sqlite/schemas/index.ts";

import type {
  BatchMetadataResult
} from "#types/index.ts";


/**
 * Fetches all metadata (writers, pencilers, genres, etc.) for multiple comic books in a single batch operation.
 * This is significantly more efficient than fetching metadata for each comic individually,
 * as it reduces N*15 queries to just 15 parallel queries.
 *
 * @param comicBookIds - Array of comic book IDs to fetch metadata for
 * @returns A promise that resolves to an object mapping comic book IDs to their associated metadata
 *
 * @example
 * ```ts
 * const ids = [1, 2, 3];
 * const metadataMap = await getMetadataForComicBooksBatch(ids);
 * // metadataMap = {
 * //   1: { writers: [...], genres: [...] },
 * //   2: { writers: [...], characters: [...] },
 * //   3: { publishers: [...], imprints: [...] }
 * // }
 * ```
 */
export const getMetadataForComicBooksBatch = async (
  comicBookIds: number[],
): Promise<BatchMetadataResult> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  if (comicBookIds.length === 0) {
    return {};
  }

  const result: BatchMetadataResult = {};

  comicBookIds.forEach((id) => {
    result[id] = {};
  });

  const [writers, pencilers, inkers, letterers, editors, colorists, coverArtists, publishers, imprints, genres, characters, teams, locations, storyArcs, seriesGroups] = await Promise.all([
    db
      .select({ id: comicWritersTable.id, name: comicWritersTable.name, description: comicWritersTable.description, createdAt: comicWritersTable.createdAt, updatedAt: comicWritersTable.updatedAt, comicBookId: comicBookWritersTable.comicBookId })
      .from(comicWritersTable)
      .innerJoin(comicBookWritersTable, eq(comicWritersTable.id, comicBookWritersTable.comicWriterId))
      .where(inArray(comicBookWritersTable.comicBookId, comicBookIds)),

    db
      .select({ id: comicPencilersTable.id, name: comicPencilersTable.name, description: comicPencilersTable.description, createdAt: comicPencilersTable.createdAt, updatedAt: comicPencilersTable.updatedAt, comicBookId: comicBookPencilersTable.comicBookId })
      .from(comicPencilersTable)
      .innerJoin(comicBookPencilersTable, eq(comicPencilersTable.id, comicBookPencilersTable.comicPencilerId))
      .where(inArray(comicBookPencilersTable.comicBookId, comicBookIds)),

    db
      .select({ id: comicInkersTable.id, name: comicInkersTable.name, description: comicInkersTable.description, createdAt: comicInkersTable.createdAt, updatedAt: comicInkersTable.updatedAt, comicBookId: comicBookInkersTable.comicBookId })
      .from(comicInkersTable)
      .innerJoin(comicBookInkersTable, eq(comicInkersTable.id, comicBookInkersTable.comicInkerId))
      .where(inArray(comicBookInkersTable.comicBookId, comicBookIds)),

    db
      .select({ id: comicLetterersTable.id, name: comicLetterersTable.name, description: comicLetterersTable.description, createdAt: comicLetterersTable.createdAt, updatedAt: comicLetterersTable.updatedAt, comicBookId: comicBookLetterersTable.comicBookId })
      .from(comicLetterersTable)
      .innerJoin(comicBookLetterersTable, eq(comicLetterersTable.id, comicBookLetterersTable.comicLettererId))
      .where(inArray(comicBookLetterersTable.comicBookId, comicBookIds)),

    db
      .select({ id: comicEditorsTable.id, name: comicEditorsTable.name, description: comicEditorsTable.description, createdAt: comicEditorsTable.createdAt, updatedAt: comicEditorsTable.updatedAt, comicBookId: comicBookEditorsTable.comicBookId })
      .from(comicEditorsTable)
      .innerJoin(comicBookEditorsTable, eq(comicEditorsTable.id, comicBookEditorsTable.comicEditorId))
      .where(inArray(comicBookEditorsTable.comicBookId, comicBookIds)),

    db
      .select({ id: comicColoristsTable.id, name: comicColoristsTable.name, description: comicColoristsTable.description, createdAt: comicColoristsTable.createdAt, updatedAt: comicColoristsTable.updatedAt, comicBookId: comicBookColoristsTable.comicBookId })
      .from(comicColoristsTable)
      .innerJoin(comicBookColoristsTable, eq(comicColoristsTable.id, comicBookColoristsTable.comicColoristId))
      .where(inArray(comicBookColoristsTable.comicBookId, comicBookIds)),

    db
      .select({ id: comicCoverArtistsTable.id, name: comicCoverArtistsTable.name, description: comicCoverArtistsTable.description, createdAt: comicCoverArtistsTable.createdAt, updatedAt: comicCoverArtistsTable.updatedAt, comicBookId: comicBookCoverArtistsTable.comicBookId })
      .from(comicCoverArtistsTable)
      .innerJoin(comicBookCoverArtistsTable, eq(comicCoverArtistsTable.id, comicBookCoverArtistsTable.comicCoverArtistId))
      .where(inArray(comicBookCoverArtistsTable.comicBookId, comicBookIds)),

    db
      .select({ id: comicPublishersTable.id, name: comicPublishersTable.name, description: comicPublishersTable.description, createdAt: comicPublishersTable.createdAt, updatedAt: comicPublishersTable.updatedAt, comicBookId: comicBookPublishersTable.comicBookId })
      .from(comicPublishersTable)
      .innerJoin(comicBookPublishersTable, eq(comicPublishersTable.id, comicBookPublishersTable.comicPublisherId))
      .where(inArray(comicBookPublishersTable.comicBookId, comicBookIds)),

    db
      .select({ id: comicImprintsTable.id, name: comicImprintsTable.name, description: comicImprintsTable.description, createdAt: comicImprintsTable.createdAt, updatedAt: comicImprintsTable.updatedAt, comicBookId: comicBookImprintsTable.comicBookId })
      .from(comicImprintsTable)
      .innerJoin(comicBookImprintsTable, eq(comicImprintsTable.id, comicBookImprintsTable.comicImprintId))
      .where(inArray(comicBookImprintsTable.comicBookId, comicBookIds)),

    db
      .select({ id: comicGenresTable.id, name: comicGenresTable.name, description: comicGenresTable.description, createdAt: comicGenresTable.createdAt, updatedAt: comicGenresTable.updatedAt, comicBookId: comicBookGenresTable.comicBookId })
      .from(comicGenresTable)
      .innerJoin(comicBookGenresTable, eq(comicGenresTable.id, comicBookGenresTable.comicGenreId))
      .where(inArray(comicBookGenresTable.comicBookId, comicBookIds)),

    db
      .select({ id: comicCharactersTable.id, name: comicCharactersTable.name, description: comicCharactersTable.description, createdAt: comicCharactersTable.createdAt, updatedAt: comicCharactersTable.updatedAt, comicBookId: comicBookCharactersTable.comicBookId })
      .from(comicCharactersTable)
      .innerJoin(comicBookCharactersTable, eq(comicCharactersTable.id, comicBookCharactersTable.comicCharacterId))
      .where(inArray(comicBookCharactersTable.comicBookId, comicBookIds)),

    db
      .select({ id: comicTeamsTable.id, name: comicTeamsTable.name, description: comicTeamsTable.description, createdAt: comicTeamsTable.createdAt, updatedAt: comicTeamsTable.updatedAt, comicBookId: comicBookTeamsTable.comicBookId })
      .from(comicTeamsTable)
      .innerJoin(comicBookTeamsTable, eq(comicTeamsTable.id, comicBookTeamsTable.comicTeamId))
      .where(inArray(comicBookTeamsTable.comicBookId, comicBookIds)),

    db
      .select({ id: comicLocationsTable.id, name: comicLocationsTable.name, description: comicLocationsTable.description, createdAt: comicLocationsTable.createdAt, updatedAt: comicLocationsTable.updatedAt, comicBookId: comicBookLocationsTable.comicBookId })
      .from(comicLocationsTable)
      .innerJoin(comicBookLocationsTable, eq(comicLocationsTable.id, comicBookLocationsTable.comicLocationId))
      .where(inArray(comicBookLocationsTable.comicBookId, comicBookIds)),

    db
      .select({ id: comicStoryArcsTable.id, name: comicStoryArcsTable.name, description: comicStoryArcsTable.description, createdAt: comicStoryArcsTable.createdAt, updatedAt: comicStoryArcsTable.updatedAt, comicBookId: comicBookStoryArcsTable.comicBookId })
      .from(comicStoryArcsTable)
      .innerJoin(comicBookStoryArcsTable, eq(comicStoryArcsTable.id, comicBookStoryArcsTable.comicStoryArcId))
      .where(inArray(comicBookStoryArcsTable.comicBookId, comicBookIds)),

    db
      .select({ id: comicSeriesGroupsTable.id, name: comicSeriesGroupsTable.name, description: comicSeriesGroupsTable.description, createdAt: comicSeriesGroupsTable.createdAt, updatedAt: comicSeriesGroupsTable.updatedAt, comicBookId: comicBookSeriesGroupsTable.comicBookId })
      .from(comicSeriesGroupsTable)
      .innerJoin(comicBookSeriesGroupsTable, eq(comicSeriesGroupsTable.id, comicBookSeriesGroupsTable.comicSeriesGroupId))
      .where(inArray(comicBookSeriesGroupsTable.comicBookId, comicBookIds)),
  ]);

  writers.forEach((row) => {
    if (result[row.comicBookId]) {
      result[row.comicBookId].writers = result[row.comicBookId].writers || [];
      const { comicBookId, ...writerData } = row;
      result[row.comicBookId].writers!.push(writerData);
    }
  });

  pencilers.forEach((row) => {
    if (result[row.comicBookId]) {
      result[row.comicBookId].pencilers = result[row.comicBookId].pencilers || [];
      const { comicBookId, ...data } = row;
      result[row.comicBookId].pencilers!.push(data);
    }
  });

  inkers.forEach((row) => {
    if (result[row.comicBookId]) {
      result[row.comicBookId].inkers = result[row.comicBookId].inkers || [];
      const { comicBookId, ...data } = row;
      result[row.comicBookId].inkers!.push(data);
    }
  });

  letterers.forEach((row) => {
    if (result[row.comicBookId]) {
      result[row.comicBookId].letterers = result[row.comicBookId].letterers || [];
      const { comicBookId, ...data } = row;
      result[row.comicBookId].letterers!.push(data);
    }
  });

  editors.forEach((row) => {
    if (result[row.comicBookId]) {
      result[row.comicBookId].editors = result[row.comicBookId].editors || [];
      const { comicBookId, ...data } = row;
      result[row.comicBookId].editors!.push(data);
    }
  });

  colorists.forEach((row) => {
    if (result[row.comicBookId]) {
      result[row.comicBookId].colorists = result[row.comicBookId].colorists || [];
      const { comicBookId, ...data } = row;
      result[row.comicBookId].colorists!.push(data);
    }
  });

  coverArtists.forEach((row) => {
    if (result[row.comicBookId]) {
      result[row.comicBookId].coverArtists = result[row.comicBookId].coverArtists || [];
      const { comicBookId, ...data } = row;
      result[row.comicBookId].coverArtists!.push(data);
    }
  });

  publishers.forEach((row) => {
    if (result[row.comicBookId]) {
      result[row.comicBookId].publishers = result[row.comicBookId].publishers || [];
      const { comicBookId, ...data } = row;
      result[row.comicBookId].publishers!.push(data);
    }
  });

  imprints.forEach((row) => {
    if (result[row.comicBookId]) {
      result[row.comicBookId].imprints = result[row.comicBookId].imprints || [];
      const { comicBookId, ...data } = row;
      result[row.comicBookId].imprints!.push(data);
    }
  });

  genres.forEach((row) => {
    if (result[row.comicBookId]) {
      result[row.comicBookId].genres = result[row.comicBookId].genres || [];
      const { comicBookId, ...data } = row;
      result[row.comicBookId].genres!.push(data);
    }
  });

  characters.forEach((row) => {
    if (result[row.comicBookId]) {
      result[row.comicBookId].characters = result[row.comicBookId].characters || [];
      const { comicBookId, ...data } = row;
      result[row.comicBookId].characters!.push(data);
    }
  });

  teams.forEach((row) => {
    if (result[row.comicBookId]) {
      result[row.comicBookId].teams = result[row.comicBookId].teams || [];
      const { comicBookId, ...data } = row;
      result[row.comicBookId].teams!.push(data);
    }
  });

  locations.forEach((row) => {
    if (result[row.comicBookId]) {
      result[row.comicBookId].locations = result[row.comicBookId].locations || [];
      const { comicBookId, ...data } = row;
      result[row.comicBookId].locations!.push(data);
    }
  });

  storyArcs.forEach((row) => {
    if (result[row.comicBookId]) {
      result[row.comicBookId].storyArcs = result[row.comicBookId].storyArcs || [];
      const { comicBookId, ...data } = row;
      result[row.comicBookId].storyArcs!.push(data);
    }
  });

  seriesGroups.forEach((row) => {
    if (result[row.comicBookId]) {
      result[row.comicBookId].seriesGroups = result[row.comicBookId].seriesGroups || [];
      const { comicBookId, ...data } = row;
      result[row.comicBookId].seriesGroups!.push(data);
    }
  });

  return result;
};