import { getClient } from "../client.ts";
import { comicWebLinksTable } from "../schema.ts";
import { eq } from "drizzle-orm";

export const insertComicWebLink = async (comic_book_id: number, url: string, description?: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicWebLinksTable)
      .values({ comic_book_id, url, description: description ?? null })
      .onConflictDoNothing()
      .returning({ id: comicWebLinksTable.id });
      
    // If result is empty, it means the web link already exists due to onConflictDoNothing
    if (!result.length) {
      const existingLink = await db
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
