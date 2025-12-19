import { eq, and, asc, desc } from "drizzle-orm";

import { getClient } from "../client.ts";

import type { ComicStoryArc} from "#types/index.ts";
import type { ComicStoryArcQueryParams } from "../../../interfaces/RequestParams.interface.ts";
import { comicBookStoryArcsTable, comicStoryArcsTable } from "../schema.ts";
import { PAGE_SIZE_DEFAULT } from "../../../utilities/constants.ts";

export const getAllComicStoryArcs = async (
  params: ComicStoryArcQueryParams = {}
): Promise<ComicStoryArc[]> => {
  const { db, client } = getClient();

  const {
    offset = 0,
    limit = PAGE_SIZE_DEFAULT,
    nameFilter,
    descriptionFilter,
    sortBy,
    sortOrder
  } = params;

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {

    const whereConditions = [];

    if (nameFilter) {
      whereConditions.push(eq(comicStoryArcsTable.name, nameFilter));
    }

    if (descriptionFilter) {
      whereConditions.push(eq(comicStoryArcsTable.description, descriptionFilter));
    }

    let orderByColumn;

    switch (sortBy) {
      case "name":
        orderByColumn = comicStoryArcsTable.name;
        break;
      case "created_at":
        orderByColumn = comicStoryArcsTable.createdAt;
        break;
      case "updated_at":
        orderByColumn = comicStoryArcsTable.updatedAt;
        break;
      default:
        orderByColumn = comicStoryArcsTable.id;
        break;
    }

    const baseQuery = db.select().from(comicStoryArcsTable).$dynamic();

    // Apply where conditions
    const finalQuery = whereConditions.length > 0
          ? baseQuery.where(and(...whereConditions))
          : baseQuery;


    const result = await finalQuery
          .orderBy(sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn))
          .limit(limit)
          .offset(offset);

    return result;
  } catch (error) {
    console.error("Error fetching all comic story arcs:", error);
    throw new Error("Failed to fetch all comic story arcs.");
  }
};

export const getComicStoryArcById = async (
  storyArcId: number,
): Promise<ComicStoryArc | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select()
      .from(comicStoryArcsTable)
      .where(eq(comicStoryArcsTable.id, storyArcId));

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error(
      `Error fetching comic story arc by ID ${storyArcId}:`,
      error,
    );
    throw new Error("Failed to fetch comic story arc by ID.");
  }
};

export const getComicsInStoryArc = async (
  storyArcId: number,
): Promise<number[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select({ comicBookId: comicBookStoryArcsTable.comicBookId })
      .from(comicBookStoryArcsTable)
      .where(eq(comicBookStoryArcsTable.comicStoryArcId, storyArcId));

    return result.map((row) => row.comicBookId);
  } catch (error) {
    console.error(
      `Error fetching comics in story arc ID ${storyArcId}:`,
      error,
    );
    throw new Error("Failed to fetch comics in story arc.");
  }
};

export const getComicStoryArcByName = async (
  name: string,
): Promise<ComicStoryArc | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select()
      .from(comicStoryArcsTable)
      .where(eq(comicStoryArcsTable.name, name));

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error(
      `Error fetching comic story arc by name ${name}:`,
      error,
    );
    throw new Error("Failed to fetch comic story arc by name.");
  }
};

export const insertComicStoryArc = async (name: string, description?: string ): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicStoryArcsTable)
      .values({ name, description })
      .onConflictDoNothing()
      .returning({ id: comicStoryArcsTable.id });

    // If result is empty, it means the story arc already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing story arc by name (which should be unique)
      const existingStoryArc = await db
        .select({ id: comicStoryArcsTable.id })
        .from(comicStoryArcsTable)
        .where(eq(comicStoryArcsTable.name, name));

      if (existingStoryArc.length > 0) {
        console.log(
          `Comic story arc already exists with name: ${name}, returning existing ID: ${
            existingStoryArc[0].id
          }`,
        );
        return existingStoryArc[0].id;
      }

      throw new Error(
        `Failed to insert comic story arc and could not find existing story arc. Name: ${name}`,
      );
    }

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic story arc:", error);
    throw new Error("Failed to insert comic story arc.");
  }
};

export const deleteComicStoryArcById = async (
  storyArcId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .delete(comicStoryArcsTable)
      .where(eq(comicStoryArcsTable.id, storyArcId));
  } catch (error) {
    console.error("Error deleting comic story arc by ID:", error);
    throw new Error("Failed to delete comic story arc by ID.");
  }
};

export const linkStoryArcToComicBook = async (
  storyArcId: number,
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .insert(comicBookStoryArcsTable)
      .values({ comicStoryArcId: storyArcId, comicBookId: comicBookId })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error("Error linking comic story arc to comic book:", error);
    throw new Error("Failed to link comic story arc to comic book.");
  }
};

export const getStoryArcsByComicBookId = async (
  comicBookId: number,
): Promise<ComicStoryArc[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select({
        comic_story_arc: comicStoryArcsTable,
      })
      .from(comicStoryArcsTable)
      .innerJoin(
        comicBookStoryArcsTable,
        eq(comicStoryArcsTable.id, comicBookStoryArcsTable.comicStoryArcId),
      )
      .where(eq(comicBookStoryArcsTable.comicBookId, comicBookId));

    return result.map((row) => row.comic_story_arc);
  } catch (error) {
    console.error(
      `Error fetching story arcs for comic book ID ${comicBookId}:`,
      error,
    );
    throw new Error("Failed to fetch story arcs for comic book.");
  }
};

