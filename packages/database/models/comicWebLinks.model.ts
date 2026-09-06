import { eq } from "drizzle-orm";

import { getClient } from "../drizzle/client.ts";
import { dbLogger } from "../loggers/index.ts";

import { comicWebLinksTable } from "../schemas/index.ts";

/**
 * Inserts a web link for a comic book into the database, returning its ID. If
 * the web link already exists (url is unique), the existing web link's ID is
 * returned.
 * @param url The web link URL
 * @param comicBookId The ID of the comic book the web link belongs to
 * @returns The ID of the web link
 */
export const insertWebLink = async (
  url: string,
  comicBookId: number,
): Promise<number> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const insertResult: { id: number }[] = await db
      .insert(comicWebLinksTable)
      .values({ url, comicBookId })
      .onConflictDoNothing()
      .returning({ id: comicWebLinksTable.id });

    if (insertResult[0]) {
      return insertResult[0].id;
    }

    const existingWebLink = await db
      .select({ id: comicWebLinksTable.id })
      .from(comicWebLinksTable)
      .where(eq(comicWebLinksTable.url, url))
      .limit(1);

    if (!existingWebLink[0]) {
      throw new Error("Web link already exists but could not be fetched.");
    }

    return existingWebLink[0].id;
  } catch (error) {
    dbLogger.error("Error inserting web link:" + error);
    throw error;
  }
};