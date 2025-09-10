import { getClient } from "../client.ts";
import { comicBookStoryArcsTable, comicStoryArcsTable } from "../schema.ts";
import { eq } from "drizzle-orm";

export const insertComicStoryArc = async (name: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicStoryArcsTable)
      .values({ name })
      .onConflictDoNothing()
      .returning({ id: comicStoryArcsTable.id });

    // If result is empty, it means the story arc already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing story arc by name (which should be unique)
      const existingStoryArc = await db
        .select({ id: comicStoryArcsTable.id })
        .from(comicStoryArcsTable)
        .where(eq(comicStoryArcsTable.name, name));

      if (existingStoryArc.length > 0) {
        console.log(
          `Comic story arc already exists with name: ${name}, returning existing ID: ${
            existingStoryArc[0].id
          }`,
        );
        return existingStoryArc[0].id;
      }

      throw new Error(
        `Failed to insert comic story arc and could not find existing story arc. Name: ${name}`,
      );
    }

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic story arc:", error);
    throw new Error("Failed to insert comic story arc.");
  }
};

export const linkStoryArcToComicBook = async (
  storyArcId: number,
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .insert(comicBookStoryArcsTable)
      .values({ comic_story_arc_id: storyArcId, comic_book_id: comicBookId })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error("Error linking comic story arc to comic book:", error);
    throw new Error("Failed to link comic story arc to comic book.");
  }
};
