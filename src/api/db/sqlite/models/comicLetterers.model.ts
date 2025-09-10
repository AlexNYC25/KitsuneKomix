import { getClient } from "../client.ts";
import { comicBookLetterersTable, comicLetterersTable } from "../schema.ts";
import { eq } from "drizzle-orm";

export const insertComicLetterer = async (name: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicLetterersTable)
      .values({ name })
      .onConflictDoNothing()
      .returning({ id: comicLetterersTable.id });

    // If result is empty, it means the letterer already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing letterer by name (which should be unique)
      const existingLetterer = await db
        .select({ id: comicLetterersTable.id })
        .from(comicLetterersTable)
        .where(eq(comicLetterersTable.name, name));

      if (existingLetterer.length > 0) {
        console.log(
          `Comic letterer already exists with name: ${name}, returning existing ID: ${
            existingLetterer[0].id
          }`,
        );
        return existingLetterer[0].id;
      }

      throw new Error(
        `Failed to insert comic letterer and could not find existing letterer. Name: ${name}`,
      );
    }

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic letterer:", error);
    throw error;
  }
};

export const linkLettererToComicBook = async (
  lettererId: number,
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .insert(comicBookLetterersTable)
      .values({ comic_letterer_id: lettererId, comic_book_id: comicBookId })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error("Error linking letterer to comic book:", error);
    throw error;
  }
};
