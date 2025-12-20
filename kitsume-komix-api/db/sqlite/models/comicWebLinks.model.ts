import { eq } from "drizzle-orm";

import { getClient } from "../client.ts";
import { comicWebLinksTable } from "../schema.ts";

/**
 * Inserts a new comic web link into the database
 * @param comicBookId The ID of the comic book
 * @param url The URL of the web link
 * @param description Optional description of the web link
 * @returns The ID of the newly inserted or existing web link
 */
export const insertComicWebLink = async (
  comicBookId: number,
  url: string,
  description?: string,
): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicWebLinksTable)
      .values({ comicBookId: comicBookId, url, description: description ?? null })
      .onConflictDoNothing()
      .returning({ id: comicWebLinksTable.id });

    // If result is empty, it means the web link already exists due to onConflictDoNothing
    if (!result.length) {
      const existingLink: { id: number }[] = await db
        .select()
        .from(comicWebLinksTable)
        .where(eq(comicWebLinksTable.url, url))
        .execute();

      if (existingLink.length) {
        return existingLink[0].id;
      }
    }

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic web link:", error);
    throw new Error("Failed to insert comic web link.");
  }
};
