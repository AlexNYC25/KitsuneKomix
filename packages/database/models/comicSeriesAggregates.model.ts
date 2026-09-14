import { getClient } from "../drizzle/client.ts";
import { dbLogger } from "../loggers/index.ts";

import {
  comicSeriesContentAggregateTable,
  comicSeriesCreditsAggregateTable,
  comicSeriesGenresAggregateTable,
  comicSeriesGroupsAggregateTable,
  comicSeriesPublishersAggregateTable,
  comicSeriesStoryArcsAggregateTable,
} from "../schemas/index.ts";

/**
 * Associates a genre with a comic series by creating an aggregate record.
 * @param genreId The ID of the genre
 * @param seriesId The ID of the comic series
 * @returns A boolean indicating whether a new record was created
 */
export const linkGenreToSeries = async (
  genreId: number,
  seriesId: number,
): Promise<boolean> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicSeriesGenresAggregateTable)
      .values({
        comicSeriesId: seriesId,
        comicGenreId: genreId,
      })
      .onConflictDoNothing()
      .returning({ id: comicSeriesGenresAggregateTable.id });

    return result.length > 0;
  } catch (error) {
    dbLogger.error("Error linking genre to series:" + error);
    throw error;
  }
};

/**
 * Associates a publisher with a comic series by creating an aggregate record.
 * @param publisherId The ID of the publisher
 * @param seriesId The ID of the comic series
 * @returns A boolean indicating whether a new record was created
 */
export const linkPublisherToSeries = async (
  publisherId: number,
  seriesId: number,
): Promise<boolean> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicSeriesPublishersAggregateTable)
      .values({
        comicSeriesId: seriesId,
        comicPublisherId: publisherId,
      })
      .onConflictDoNothing()
      .returning({ id: comicSeriesPublishersAggregateTable.id });

    return result.length > 0;
  } catch (error) {
    dbLogger.error("Error linking publisher to series:" + error);
    throw error;
  }
};

/**
 * Associates a credit (a creator with a role) with a comic series by creating
 * an aggregate record.
 * @param creditId The ID of the credit
 * @param seriesId The ID of the comic series
 * @returns A boolean indicating whether a new record was created
 */
export const linkCreditToSeries = async (
  creditId: number,
  seriesId: number,
): Promise<boolean> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicSeriesCreditsAggregateTable)
      .values({
        comicSeriesId: seriesId,
        comicCreditId: creditId,
      })
      .onConflictDoNothing()
      .returning({ id: comicSeriesCreditsAggregateTable.id });

    return result.length > 0;
  } catch (error) {
    dbLogger.error("Error linking credit to series:" + error);
    throw error;
  }
};

/**
 * Associates a piece of content (e.g. a character, team or location) with a
 * comic series by creating an aggregate record.
 * @param contentId The ID of the content
 * @param seriesId The ID of the comic series
 * @returns A boolean indicating whether a new record was created
 */
export const linkContentToSeries = async (
  contentId: number,
  seriesId: number,
): Promise<boolean> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicSeriesContentAggregateTable)
      .values({
        comicSeriesId: seriesId,
        comicContentId: contentId,
      })
      .onConflictDoNothing()
      .returning({ id: comicSeriesContentAggregateTable.id });

    return result.length > 0;
  } catch (error) {
    dbLogger.error("Error linking content to series:" + error);
    throw error;
  }
};

/**
 * Associates a story arc with a comic series by creating an aggregate record.
 * The position indicates the order of the story arc relative to the series.
 * @param storyArcId The ID of the story arc
 * @param seriesId The ID of the comic series
 * @param position The zero-based order of the story arc in the series
 * @returns A boolean indicating whether a new record was created
 */
export const linkStoryArcToSeries = async (
  storyArcId: number,
  seriesId: number,
  position: number,
): Promise<boolean> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicSeriesStoryArcsAggregateTable)
      .values({
        comicSeriesId: seriesId,
        comicStoryArcId: storyArcId,
        position,
      })
      .onConflictDoNothing()
      .returning({ id: comicSeriesStoryArcsAggregateTable.id });

    return result.length > 0;
  } catch (error) {
    dbLogger.error("Error linking story arc to series:" + error);
    throw error;
  }
};

/**
 * Associates a series group with a comic series by creating an aggregate
 * record. The position indicates the order of the series group relative to the
 * series.
 * @param seriesGroupId The ID of the series group
 * @param seriesId The ID of the comic series
 * @param position The zero-based order of the series group in the series
 * @returns A boolean indicating whether a new record was created
 */
export const linkSeriesGroupToSeries = async (
  seriesGroupId: number,
  seriesId: number,
  position: number,
): Promise<boolean> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicSeriesGroupsAggregateTable)
      .values({
        comicSeriesId: seriesId,
        comicSeriesGroupId: seriesGroupId,
        position,
      })
      .onConflictDoNothing()
      .returning({ id: comicSeriesGroupsAggregateTable.id });

    return result.length > 0;
  } catch (error) {
    dbLogger.error("Error linking series group to series:" + error);
    throw error;
  }
};