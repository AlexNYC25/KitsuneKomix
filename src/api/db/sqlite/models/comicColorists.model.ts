import { getClient } from "../client.ts";
import { comicBookColoristsTable, comicColoristsTable } from "../schema.ts";
import { eq } from "drizzle-orm";

export const insertComicColorist = async (name: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicColoristsTable)
      .values({ name })
      .onConflictDoNothing()
      .returning({ id: comicColoristsTable.id });

    // If result is empty, it means the colorist already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing colorist by name (which should be unique)
      const existingColorist = await db
        .select({ id: comicColoristsTable.id })
        .from(comicColoristsTable)
        .where(eq(comicColoristsTable.name, name));

      if (existingColorist.length > 0) {
        console.log(
          `Comic colorist already exists with name: ${name}, returning existing ID: ${
            existingColorist[0].id
          }`,
        );
        return existingColorist[0].id;
      }

      throw new Error(
        `Failed to insert comic colorist and could not find existing colorist. Name: ${name}`,
      );
    }

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic colorist:", error);
    throw error;
  }
};

export const linkColoristToComicBook = async (
  coloristId: number,
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .insert(comicBookColoristsTable)
      .values({ comic_colorist_id: coloristId, comic_book_id: comicBookId })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error("Error linking colorist to comic book:", error);
    throw error;
  }
};
