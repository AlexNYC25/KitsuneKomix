import { eq, ilike } from "drizzle-orm";

import { getClient } from "../client.ts";

import type { ComicPublisher } from "../../../types/index.ts";
import { comicBookPublishersTable, comicPublishersTable } from "../schema.ts";

export const insertComicPublisher = async (name: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicPublishersTable)
      .values({ name })
      .onConflictDoNothing()
      .returning({ id: comicPublishersTable.id });

    // If result is empty, it means the publisher already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing publisher by name (which should be unique)
      const existingPublisher = await db
        .select({ id: comicPublishersTable.id })
        .from(comicPublishersTable)
        .where(eq(comicPublishersTable.name, name));

      if (existingPublisher.length > 0) {
        console.log(
          `Comic publisher already exists with name: ${name}, returning existing ID: ${
            existingPublisher[0].id
          }`,
        );
        return existingPublisher[0].id;
      }

      throw new Error(
        `Failed to insert comic publisher and could not find existing publisher. Name: ${name}`,
      );
    }

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic publisher:", error);
    throw new Error("Failed to insert comic publisher.");
  }
};

export const linkPublisherToComicBook = async (
  publisherId: number,
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .insert(comicBookPublishersTable)
      .values({ comic_publisher_id: publisherId, comic_book_id: comicBookId })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error("Error linking publisher to comic book:", error);
    throw error;
  }
};

export const getPublishersByComicBookId = async (
  comicBookId: number,
): Promise<ComicPublisher[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select({
        comic_publisher: comicPublishersTable,
      })
      .from(comicPublishersTable)
      .innerJoin(
        comicBookPublishersTable,
        eq(
          comicPublishersTable.id,
          comicBookPublishersTable.comic_publisher_id,
        ),
      )
      .where(eq(comicBookPublishersTable.comic_book_id, comicBookId));

    return result.map((row) => row.comic_publisher);
  } catch (error) {
    console.error("Error fetching publishers for comic book:", error);
    throw error;
  }
};

export const getPublisherIdsByFilter = async (
  filter: string,
): Promise<number[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select({ id: comicPublishersTable.id })
      .from(comicPublishersTable)
      .where(ilike(comicPublishersTable.name, `%${filter}%`));

    return result.map((row) => row.id);
  } catch (error) {
    console.error("Error fetching publisher IDs by filter:", error);
    throw error;
  }
};
