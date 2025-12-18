import { and, eq } from "drizzle-orm";

import { getClient } from "../client.ts";

import { comicBookHistoryTable } from "../schema.ts";
import type {
  ComicBookHistory,
  NewComicBookHistory,
} from "#types/index.ts";

export const insertComicBookHistory = async (
  historyData: NewComicBookHistory,
): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicBookHistoryTable)
      .values(historyData)
      .returning({ id: comicBookHistoryTable.id });

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic book history:", error);
    throw error;
  }
};

export const getComicBookHistoryByUserAndComic = async (
  userId: number,
  comicBookId: number,
): Promise<ComicBookHistory | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select()
      .from(comicBookHistoryTable)
      .where(
        and(
          eq(comicBookHistoryTable.userId, userId),
          eq(comicBookHistoryTable.comicBookId, comicBookId),
        ),
      )
      .all();

    return result[0] || null;
  } catch (error) {
    console.error("Error fetching comic book history:", error);
    throw error;
  }
};

export const updateComicBookHistory = async (
  id: number,
  updates: Partial<NewComicBookHistory>,
): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .update(comicBookHistoryTable)
      .set(updates)
      .where(eq(comicBookHistoryTable.id, id))
      .run();
    return id;
  } catch (error) {
    console.error("Error updating comic book history:", error);
    throw error;
  }
};
