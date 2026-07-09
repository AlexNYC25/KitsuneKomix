import { getClient } from "../../drizzle/client.ts";
import { inArray, eq } from "drizzle-orm";
import {
  comicBookPublishersTable,
  comicPublishersTable,
  comicBookGenresTable,
  comicGenresTable,
  comicBookStoryArcsTable,
  comicStoryArcsTable,
} from "../../schemas/index.ts";

import type {
  BatchMetadataResult
} from "../../shared/types/index.ts";


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
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  if (comicBookIds.length === 0) {
    return {};
  }

  const result: BatchMetadataResult = {};

  comicBookIds.forEach((id) => {
    result[id] = {};
  });

  const [writers, pencilers, inkers] = await Promise.all([


    db
      .select({ id: comicPublishersTable.id, name: comicPublishersTable.name, description: comicPublishersTable.description, createdAt: comicPublishersTable.createdAt, updatedAt: comicPublishersTable.updatedAt, comicBookId: comicBookPublishersTable.comicBookId })
      .from(comicPublishersTable)
      .innerJoin(comicBookPublishersTable, eq(comicPublishersTable.id, comicBookPublishersTable.comicPublisherId))
      .where(inArray(comicBookPublishersTable.comicBookId, comicBookIds)),

    db
      .select({ id: comicGenresTable.id, name: comicGenresTable.name, description: comicGenresTable.description, createdAt: comicGenresTable.createdAt, updatedAt: comicGenresTable.updatedAt, comicBookId: comicBookGenresTable.comicBookId })
      .from(comicGenresTable)
      .innerJoin(comicBookGenresTable, eq(comicGenresTable.id, comicBookGenresTable.comicGenreId))
      .where(inArray(comicBookGenresTable.comicBookId, comicBookIds)),


    db
      .select({ id: comicStoryArcsTable.id, name: comicStoryArcsTable.name, description: comicStoryArcsTable.description, createdAt: comicStoryArcsTable.createdAt, updatedAt: comicStoryArcsTable.updatedAt, comicBookId: comicBookStoryArcsTable.comicBookId })
      .from(comicStoryArcsTable)
      .innerJoin(comicBookStoryArcsTable, eq(comicStoryArcsTable.id, comicBookStoryArcsTable.comicStoryArcId))
      .where(inArray(comicBookStoryArcsTable.comicBookId, comicBookIds)),

  ]);


  return result;
};