import { eq, ilike } from "drizzle-orm";

import { getClient } from "../client.ts";

import { comicBookLocationsTable, comicLocationsTable } from "../schema.ts";
import type { ComicLocation } from "../../../types/index.ts";

export const insertComicLocation = async (name: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicLocationsTable)
      .values({ name })
      .onConflictDoNothing()
      .returning({ id: comicLocationsTable.id });

    // If result is empty, it means the location already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing location by name (which should be unique)
      const existingLocation = await db
        .select({ id: comicLocationsTable.id })
        .from(comicLocationsTable)
        .where(eq(comicLocationsTable.name, name));

      if (existingLocation.length > 0) {
        console.log(
          `Comic location already exists at name: ${name}, returning existing ID: ${
            existingLocation[0].id
          }`,
        );
        return existingLocation[0].id;
      }

      throw new Error(
        `Failed to insert comic location and could not find existing location. Name: ${name}`,
      );
    }

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic location:", error);
    throw new Error("Failed to insert comic location.");
  }
};

export const linkLocationToComicBook = async (
  locationId: number,
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .insert(comicBookLocationsTable)
      .values({ comic_location_id: locationId, comic_book_id: comicBookId })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error("Error linking comic location to comic book:", error);
    throw new Error("Failed to link comic location to comic book.");
  }
};

export const getLocationsByComicBookId = async (
  comicBookId: number,
): Promise<ComicLocation[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select({
        comic_location: comicLocationsTable,
      })
      .from(comicLocationsTable)
      .innerJoin(
        comicBookLocationsTable,
        eq(
          comicLocationsTable.id,
          comicBookLocationsTable.comic_location_id,
        ),
      )
      .where(eq(comicBookLocationsTable.comic_book_id, comicBookId));

    return result.map((row) => row.comic_location);
  } catch (error) {
    console.error(
      "Error fetching comic locations by comic book ID:",
      error,
    );
    throw new Error("Failed to fetch comic locations.");
  }
};

export const getLocationIdsByFilter = async (
  filter: string,
): Promise<number[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select({ id: comicLocationsTable.id })
      .from(comicLocationsTable)
      .where(ilike(comicLocationsTable.name, `%${filter}%`));

    return result.map((row) => row.id);
  } catch (error) {
    console.error("Error fetching comic location IDs by filter:", error);
    throw new Error("Failed to fetch comic location IDs.");
  }
};
