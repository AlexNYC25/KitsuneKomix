import { getClient } from "../client.ts";
import {
  comicBookSeriesGroupsTable,
  comicSeriesGroupsTable,
} from "../schema.ts";
import { eq } from "drizzle-orm";

export const insertComicSeriesGroup = async (
  name: string,
  description?: string,
): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicSeriesGroupsTable)
      .values({ name, description: description ?? null })
      .onConflictDoNothing()
      .returning({ id: comicSeriesGroupsTable.id });

    // If result is empty, it means the series group already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing series group by name (which should be unique)
      const existingGroup = await db
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
        comic_series_group_id: seriesGroupId,
        comic_book_id: comicBookId,
      })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error("Error linking comic series group to comic book:", error);
    throw new Error("Failed to link comic series group to comic book.");
  }
};
