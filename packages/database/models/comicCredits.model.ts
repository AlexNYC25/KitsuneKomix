import { and, eq } from "drizzle-orm";

import { getClient } from "../drizzle/client.ts";
import { dbLogger } from "../loggers/index.ts";

import {
  comicBookCreditsTable,
  comicCreditsTable,
} from "../schemas/index.ts";

/**
 * Inserts a credit (a creator with a role) into the database, returning its
 * ID. If a credit with the same name and role already exists, the existing
 * credit's ID is returned.
 * @param name The name of the credited person
 * @param role The role of the credited person, e.g. writer, artist, colorist
 * @returns The ID of the credit
 */
export const insertCredit = async (
  name: string,
  role: string,
): Promise<number> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const insertResult: { id: number }[] = await db
      .insert(comicCreditsTable)
      .values({ name, role })
      .onConflictDoNothing()
      .returning({ id: comicCreditsTable.id });

    if (insertResult[0]) {
      return insertResult[0].id;
    }

    const existingCredit = await db
      .select({ id: comicCreditsTable.id })
      .from(comicCreditsTable)
      .where(
        and(
          eq(comicCreditsTable.name, name),
          eq(comicCreditsTable.role, role),
        ),
      )
      .limit(1);

    if (!existingCredit[0]) {
      throw new Error("Credit already exists but could not be fetched.");
    }

    return existingCredit[0].id;
  } catch (error) {
    dbLogger.error("Error inserting credit:" + error);
    throw error;
  }
};

/**
 * Associates a credit with a comic book by creating a mapping record.
 * @param creditId The ID of the credit
 * @param comicBookId The ID of the comic book
 * @returns A boolean indicating whether a new mapping was created
 */
export const linkCreditToComicBook = async (
  creditId: number,
  comicBookId: number,
): Promise<boolean> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicBookCreditsTable)
      .values({
        comicBookId,
        comicCreditId: creditId,
      })
      .onConflictDoNothing()
      .returning({ id: comicBookCreditsTable.id });

    return result.length > 0;
  } catch (error) {
    dbLogger.error("Error linking credit to comic book:" + error);
    throw error;
  }
};