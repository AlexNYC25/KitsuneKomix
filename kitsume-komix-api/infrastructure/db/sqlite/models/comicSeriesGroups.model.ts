import { eq } from "drizzle-orm";

import { getClient } from "../client.ts";
import {
  comicBookSeriesGroupsTable,
  comicSeriesGroupsTable,
} from "../schema.ts";

import type { ComicSeriesGroup } from "#types/index.ts";

/**
 * Inserts a new comic series group into the database
 * @param name The name of the series group
 * @param description Optional description of the series group
 * @returns The ID of the newly inserted or existing series group
 */
export const insertComicSeriesGroup = async (
  name: string,
  description?: string,
): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicSeriesGroupsTable)
      .values({ name, description: description ?? null })
      .onConflictDoNothing()
      .returning({ id: comicSeriesGroupsTable.id });

    // If result is empty, it means the series group already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing series group by name (which should be unique)
      const existingGroup: { id: number }[] = await db
        .select({ id: comicSeriesGroupsTable.id })
        .from(comicSeriesGroupsTable)
        .where(eq(comicSeriesGroupsTable.name, name));

      if (existingGroup.length > 0) {
        console.log(
          `Comic series group already exists with name: ${name}, returning existing ID: ${
            existingGroup[0].id
          }`,
        );
        return existingGroup[0].id;
      }

      throw new Error(
        `Failed to insert comic series group and could not find existing group. Name: ${name}`,
      );
    }

    return result[0].id;
  } catch (error) {
    console.error("Error creating comic series group:", error);
    throw error;
  }
};

/**
 * Links a series group to a comic book by creating a relationship in the junction table
 * @param seriesGroupId The ID of the series group
 * @param comicBookId The ID of the comic book
 * @returns void
 */
export const linkSeriesGroupToComicBook = async (
  seriesGroupId: number,
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .insert(comicBookSeriesGroupsTable)
      .values({
        comicSeriesGroupId: seriesGroupId,
        comicBookId: comicBookId,
      })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error("Error linking comic series group to comic book:", error);
    throw new Error("Failed to link comic series group to comic book.");
  }
};

/**
 * Unlinks all series groups from a comic book by removing all relationships in the junction table
 * @param comicBookId The ID of the comic book
 * @returns void
 */
export const unlinkSeriesGroupsToComicBook = async (
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .delete(comicBookSeriesGroupsTable)
      .where(eq(comicBookSeriesGroupsTable.comicBookId, comicBookId));
  } catch (error) {
    console.error("Error unlinking series groups from comic book:", error);
    throw error;
  }
};

/**
 * Retrieves all series groups for a specific comic book
 * @param comicBookId The ID of the comic book
 * @returns An array of ComicSeriesGroup objects associated with the comic book
 */
export const getSeriesGroupsByComicBookId = async (
  comicBookId: number,
): Promise<ComicSeriesGroup[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { comicSeriesGroup: ComicSeriesGroup }[] = await db
      .select({
        comicSeriesGroup: comicSeriesGroupsTable,
      })
      .from(comicSeriesGroupsTable)
      .innerJoin(
        comicBookSeriesGroupsTable,
        eq(
          comicSeriesGroupsTable.id,
          comicBookSeriesGroupsTable.comicSeriesGroupId,
        ),
      )
      .where(eq(comicBookSeriesGroupsTable.comicBookId, comicBookId));

    return result.map((row) => row.comicSeriesGroup);
  } catch (error) {
    console.error(
      `Error fetching series groups for comic book ID ${comicBookId}:`,
      error,
    );
    throw new Error("Failed to fetch series groups for comic book.");
  }
};
