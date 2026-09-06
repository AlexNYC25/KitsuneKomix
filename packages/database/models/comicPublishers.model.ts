import { eq } from "drizzle-orm";

import { getClient } from "../drizzle/client.ts";
import { dbLogger } from "../loggers/index.ts";

import {
  comicBookPublishersTable,
  comicPublishersTable,
} from "../schemas/index.ts";

/**
 * Inserts a publisher into the database, returning its ID. If the publisher
 * already exists (name is unique), the existing publisher's ID is returned.
 * @param name The name of the publisher to insert
 * @param imprint Whether this publisher is an imprint of another publisher
 * @returns The ID of the publisher
 */
export const insertPublisher = async (
  name: string,
  imprint: boolean = false,
): Promise<number> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const insertResult: { id: number }[] = await db
      .insert(comicPublishersTable)
      .values({ name, imprint })
      .onConflictDoNothing()
      .returning({ id: comicPublishersTable.id });

    if (insertResult[0]) {
      return insertResult[0].id;
    }

    const existingPublisher = await db
      .select({ id: comicPublishersTable.id })
      .from(comicPublishersTable)
      .where(eq(comicPublishersTable.name, name))
      .limit(1);

    if (!existingPublisher[0]) {
      throw new Error("Publisher already exists but could not be fetched.");
    }

    return existingPublisher[0].id;
  } catch (error) {
    dbLogger.error("Error inserting publisher:" + error);
    throw error;
  }
};

/**
 * Associates a publisher with a comic book by creating a mapping record.
 * @param publisherId The ID of the publisher
 * @param comicBookId The ID of the comic book
 * @returns A boolean indicating whether a new mapping was created
 */
export const linkPublisherToComicBook = async (
  publisherId: number,
  comicBookId: number,
): Promise<boolean> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicBookPublishersTable)
      .values({
        comicBookId,
        comicPublisherId: publisherId,
      })
      .onConflictDoNothing()
      .returning({ id: comicBookPublishersTable.id });

    return result.length > 0;
  } catch (error) {
    dbLogger.error("Error linking publisher to comic book:" + error);
    throw error;
  }
};