import { getClient } from "../client.ts";
import { comicBookTeamsTable, comicTeamsTable } from "../schema.ts";
import { eq } from "drizzle-orm";

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
