import { eq, ilike } from "drizzle-orm";

import { getClient } from "../client.ts";
import { comicBookTeamsTable, comicTeamsTable } from "../schema.ts";

import type { ComicTeam } from "#types/index.ts";

/**
 * Inserts a new comic team into the database
 * @param name The name of the team
 * @returns The ID of the newly inserted or existing team
 */
export const insertComicTeam = async (name: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicTeamsTable)
      .values({ name })
      .onConflictDoNothing()
      .returning({ id: comicTeamsTable.id });

    // If result is empty, it means the team already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing team by name (which should be unique)
      const existingTeam: { id: number }[] = await db
        .select({ id: comicTeamsTable.id })
        .from(comicTeamsTable)
        .where(eq(comicTeamsTable.name, name));

      if (existingTeam.length > 0) {
        console.log(
          `Comic team already exists with name: ${name}, returning existing ID: ${
            existingTeam[0].id
          }`,
        );
        return existingTeam[0].id;
      }

      throw new Error(
        `Failed to insert comic team and could not find existing team. Name: ${name}`,
      );
    }

    return result[0].id;
  } catch (error) {
    console.error(`Error inserting comic team`, error);
    throw error;
  }
};

/**
 * Links a team to a comic book by creating a relationship in the junction table
 * @param teamId The ID of the team
 * @param comicBookId The ID of the comic book
 * @returns void
 */
export const linkTeamToComicBook = async (
  teamId: number,
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .insert(comicBookTeamsTable)
      .values({ comicTeamId: teamId, comicBookId: comicBookId })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error(`Error linking comic team to comic book`, error);
    throw error;
  }
};

/**
 * Unlinks all teams from a comic book by removing all relationships in the junction table
 * @param comicBookId The ID of the comic book
 * @returns void
 */
export const unlinkTeamsToComicBook = async (
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .delete(comicBookTeamsTable)
      .where(eq(comicBookTeamsTable.comicBookId, comicBookId));
  } catch (error) {
    console.error("Error unlinking teams from comic book:", error);
    throw error;
  }
};

/**
 * Retrieves all teams for a specific comic book
 * @param comicBookId The ID of the comic book
 * @returns An array of ComicTeam objects associated with the comic book
 */
export const getTeamsByComicBookId = async (
  comicBookId: number,
): Promise<ComicTeam[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { comicTeam: ComicTeam }[] = await db
      .select({
        comicTeam: comicTeamsTable,
      })
      .from(comicTeamsTable)
      .innerJoin(
        comicBookTeamsTable,
        eq(comicTeamsTable.id, comicBookTeamsTable.comicTeamId),
      )
      .where(eq(comicBookTeamsTable.comicBookId, comicBookId));

    return result.map((row) => row.comicTeam);
  } catch (error) {
    console.error(
      `Error fetching comic teams for comic book ID ${comicBookId}`,
      error,
    );
    throw error;
  }
};

/**
 * Searches for team IDs by name filter
 * @param filter The partial name to search for (case-insensitive)
 * @returns An array of team IDs matching the filter
 */
export const getTeamIdsByFilter = async (
  filter: string,
): Promise<number[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .select({ id: comicTeamsTable.id })
      .from(comicTeamsTable)
      .where(ilike(comicTeamsTable.name, `%${filter}%`));

    return result.map((row) => row.id);
  } catch (error) {
    console.error("Error fetching comic team IDs by filter:", error);
    throw error;
  }
};
