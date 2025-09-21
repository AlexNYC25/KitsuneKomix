import { eq, ilike } from "drizzle-orm";

import { getClient } from "../client.ts";

import { comicBookTeamsTable, comicTeamsTable } from "../schema.ts";
import type { ComicTeam } from "../../../types/index.ts";

export const insertComicTeam = async (name: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicTeamsTable)
      .values({ name })
      .onConflictDoNothing()
      .returning({ id: comicTeamsTable.id });

    // If result is empty, it means the team already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing team by name (which should be unique)
      const existingTeam = await db
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
      .values({ comic_team_id: teamId, comic_book_id: comicBookId })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error(`Error linking comic team to comic book`, error);
    throw error;
  }
};

export const getTeamsByComicBookId = async (
  comicBookId: number,
): Promise<ComicTeam[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select({
        comic_team: comicTeamsTable,
      })
      .from(comicTeamsTable)
      .innerJoin(
        comicBookTeamsTable,
        eq(comicTeamsTable.id, comicBookTeamsTable.comic_team_id),
      )
      .where(eq(comicBookTeamsTable.comic_book_id, comicBookId));

    return result.map((row) => row.comic_team);
  } catch (error) {
    console.error(
      `Error fetching comic teams for comic book ID ${comicBookId}`,
      error,
    );
    throw error;
  }
};

export const getComicTeamIdsByFilter = async (
  filter: string,
): Promise<number[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select({ id: comicTeamsTable.id })
      .from(comicTeamsTable)
      .where(ilike(comicTeamsTable.name, `%${filter}%`));

    return result.map((row) => row.id);
  } catch (error) {
    console.error("Error fetching comic team IDs by filter:", error);
    throw error;
  }
};