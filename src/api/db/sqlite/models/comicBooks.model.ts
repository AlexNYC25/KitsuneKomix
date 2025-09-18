import { asc, desc, eq, sql } from "drizzle-orm";

import { getClient } from "../client.ts";

import { comicBooksTable } from "../schema.ts";
import type { ComicBook, NewComicBook } from "../../../types/index.ts";

export const getAllComicBooks = async (
  offset: number,
  limit: number,
  sort: string | undefined,
): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicBooksTable).limit(limit).offset(
      offset,
    ).orderBy(
      sort === "asc"
        ? asc(comicBooksTable.file_path)
        : desc(comicBooksTable.file_path),
    );

    return result;
  } catch (error) {
    console.error("Error fetching all comic books:", error);
    throw error;
  }
};

export const getAllComicBooksSortByDate = async (
  offset: number,
  limit: number,
  sort: string | undefined,
): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicBooksTable).limit(limit).offset(
      offset,
    ).orderBy(
      sort === "asc"
        ? asc(comicBooksTable.created_at)
        : desc(comicBooksTable.created_at),
    );

    return result;
  } catch (error) {
    console.error("Error fetching all comic books sorted by date:", error);
    throw error;
  }
};

export const getAllComicBooksSortByFileName = async (
  letter: string,
  limit: number = 50,
  offset: number = 0,
): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const likeQuery = `${letter}%`;
    const result = await db.select().from(comicBooksTable).where(
      sql`${comicBooksTable.file_path} LIKE ${likeQuery}`,
    ).orderBy(desc(comicBooksTable.file_path))
      .limit(limit)
      .offset(offset);

    return result;
  } catch (error) {
    console.error("Error fetching comic books by starting letter:", error);
    throw error;
  }
};

export const getRandomBook = async (): Promise<ComicBook | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select()
      .from(comicBooksTable)
      .orderBy(sql`RANDOM()`)
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching random comic book:", error);
    throw error;
  }
};

export const insertComicBook = async (comicBook: NewComicBook) => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const insertQuery = await db
      .insert(comicBooksTable)
      .values(comicBook)
      .returning({ id: comicBooksTable.id });

    return insertQuery[0].id;
  } catch (error) {
    console.error("Error inserting comic book:", error);
    throw error;
  }
};

export const getComicBookById = async (
  id: number,
): Promise<ComicBook | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicBooksTable).where(
      eq(comicBooksTable.id, id),
    );
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching comic book by ID:", error);
    throw error;
  }
};

export const getComicBookByFilePath = async (
  filePath: string,
): Promise<ComicBook | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicBooksTable).where(
      eq(comicBooksTable.file_path, filePath),
    );
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching comic book by file path:", error);
    throw error;
  }
};

export const getComicBooksByHash = async (
  hash: string,
): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicBooksTable).where(
      eq(comicBooksTable.hash, hash),
    );
    return result;
  } catch (error) {
    console.error("Error fetching comic books by hash:", error);
    throw error;
  }
};

export const updateComicBook = async (
  id: number,
  updates: Partial<NewComicBook>,
) => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const updateData: Record<string, unknown> = {};

    // Map all possible fields from NewComicBook type
    if (updates.library_id !== undefined) {
      updateData.library_id = updates.library_id;
    }
    if (updates.file_path !== undefined) {
      updateData.file_path = updates.file_path;
    }
    if (updates.hash !== undefined) updateData.hash = updates.hash;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.series !== undefined) updateData.series = updates.series;
    if (updates.issue_number !== undefined) {
      updateData.issue_number = updates.issue_number;
    }
    if (updates.count !== undefined) updateData.count = updates.count;
    if (updates.volume !== undefined) updateData.volume = updates.volume;
    if (updates.alternate_series !== undefined) {
      updateData.alternate_series = updates.alternate_series;
    }
    if (updates.alternate_issue_number !== undefined) {
      updateData.alternate_issue_number = updates.alternate_issue_number;
    }
    if (updates.alternate_count !== undefined) {
      updateData.alternate_count = updates.alternate_count;
    }
    if (updates.page_count !== undefined) {
      updateData.page_count = updates.page_count;
    }
    if (updates.summary !== undefined) updateData.summary = updates.summary;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.year !== undefined) updateData.year = updates.year;
    if (updates.month !== undefined) updateData.month = updates.month;
    if (updates.day !== undefined) updateData.day = updates.day;
    if (updates.publisher !== undefined) {
      updateData.publisher = updates.publisher;
    }
    if (updates.publication_date !== undefined) {
      updateData.publication_date = updates.publication_date;
    }
    if (updates.scan_info !== undefined) {
      updateData.scan_info = updates.scan_info;
    }
    if (updates.languge !== undefined) updateData.languge = updates.languge; // Note: keeping schema typo
    if (updates.format !== undefined) updateData.format = updates.format;
    if (updates.black_and_white !== undefined) {
      updateData.black_and_white = updates.black_and_white;
    }
    if (updates.manga !== undefined) updateData.manga = updates.manga;
    if (updates.reading_direction !== undefined) {
      updateData.reading_direction = updates.reading_direction;
    }
    if (updates.review !== undefined) updateData.review = updates.review;
    if (updates.age_rating !== undefined) {
      updateData.age_rating = updates.age_rating;
    }
    if (updates.community_rating !== undefined) {
      updateData.community_rating = updates.community_rating;
    }
    if (updates.file_size !== undefined) {
      updateData.file_size = updates.file_size;
    }

    if (Object.keys(updateData).length === 0) {
      return false;
    }

    const result = await db
      .update(comicBooksTable)
      .set(updateData)
      .where(eq(comicBooksTable.id, id))
      .returning({ id: comicBooksTable.id });

    return result.length > 0;
  } catch (error) {
    console.error("Error updating comic book:", error);
    throw error;
  }
};

// Add new query functions for enhanced schema

export const getComicBooksByLibrary = async (
  libraryId: number,
): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicBooksTable).where(
      eq(comicBooksTable.library_id, libraryId),
    );
    return result;
  } catch (error) {
    console.error("Error fetching comic books by library:", error);
    throw error;
  }
};

export const getComicBooksBySeries = async (
  series: string,
): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicBooksTable).where(
      eq(comicBooksTable.series, series),
    );
    return result;
  } catch (error) {
    console.error("Error fetching comic books by series:", error);
    throw error;
  }
};

export const getComicBooksByPublisher = async (
  publisher: string,
): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicBooksTable).where(
      eq(comicBooksTable.publisher, publisher),
    );
    return result;
  } catch (error) {
    console.error("Error fetching comic books by publisher:", error);
    throw error;
  }
};

export const getComicBooksByYear = async (
  year: number,
): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicBooksTable).where(
      eq(comicBooksTable.year, year),
    );
    return result;
  } catch (error) {
    console.error("Error fetching comic books by year:", error);
    throw error;
  }
};

export const getComicBookByHash = async (
  hash: string,
): Promise<ComicBook | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicBooksTable).where(
      eq(comicBooksTable.hash, hash),
    );
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching comic book by hash:", error);
    throw error;
  }
};

export const searchComicBooks = async (query: string): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const likeQuery = `%${query}%`;
    const result = await db
      .select()
      .from(comicBooksTable)
      .where(
        eq(comicBooksTable.title, likeQuery) ||
          eq(comicBooksTable.series, likeQuery) ||
          eq(comicBooksTable.publisher, likeQuery) ||
          eq(comicBooksTable.summary, likeQuery),
      );
    return result;
  } catch (error) {
    console.error("Error searching comic books:", error);
    throw error;
  }
};

export const deleteComicBook = async (id: number): Promise<boolean> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .delete(comicBooksTable)
      .where(eq(comicBooksTable.id, id))
      .returning({ id: comicBooksTable.id });

    return result.length > 0;
  } catch (error) {
    console.error("Error deleting comic book:", error);
    throw error;
  }
};

export const getComicDuplicates = async (): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    // This is a simplified example. Actual duplicate detection logic may vary.
    const result = await db
      .select()
      .from(comicBooksTable)
      .groupBy(comicBooksTable.hash)
      .having(sql`COUNT(*) > 1`);
    return result;
  } catch (error) {
    console.error("Error fetching duplicate comic books:", error);
    throw error;
  }
};
