import { eq } from "drizzle-orm";

import { getClient } from "../client.ts";

import type { ComicPage } from "../../../types/index.ts";
import { comicPagesTable } from "../schema.ts";

export const insertComicPage = async (
  comicBookId: number,
  filePath: string,
  pageNumber: number,
  hash: string,
  fileSize: number,
  type: string = "Story",
  doublePage: number = 0,
  width?: number | null,
  length?: number | null,
): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const values = {
      comicBookId: comicBookId,
      filePath: filePath,
      pageNumber: pageNumber,
      hash: hash,
      fileSize: fileSize,
      type: type,
      doublePage: doublePage,
      ...(width !== undefined && { width }),
      ...(length !== undefined && { length }),
    };

    const result = await db
      .insert(comicPagesTable)
      .values(values)
      .returning({ id: comicPagesTable.id });

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic page:", error);
    throw error;
  }
};

export const getComicPagesByComicBookId = async (
  comicBookId: number,
): Promise<ComicPage[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicPagesTable).where(
      eq(comicPagesTable.comicBookId, comicBookId),
    ).orderBy(comicPagesTable.pageNumber);
    return result;
  } catch (error) {
    console.error("Error fetching comic pages by comic book ID:", error);
    throw error;
  }
};
