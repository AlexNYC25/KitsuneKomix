import { eq, ilike } from "drizzle-orm";

import { getClient } from "../client.ts";
import { comicBookLocationsTable, comicLocationsTable } from "../schema.ts";

import type { ComicLocation } from "#types/index.ts";

/**
 * Inserts a new comic location into the database or returns the ID of an existing location with the same name
 * @param name The name of the location to insert
 * @returns The ID of the newly inserted location or the ID of the existing location with the same name
 */
export const insertComicLocation = async (name: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicLocationsTable)
      .values({ name })
      .onConflictDoNothing()
      .returning({ id: comicLocationsTable.id });

    // If result is empty, it means the location already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing location by name (which should be unique)
      const existingLocation: { id: number }[] = await db
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

/**
 * Creates a link between a location and a comic book in the database
 * @param locationId The ID of the location to link
 * @param comicBookId The ID of the comic book to link
 * @returns A promise that resolves when the link has been created
 */
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
      .values({ comicLocationId: locationId, comicBookId: comicBookId })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error("Error linking comic location to comic book:", error);
    throw new Error("Failed to link comic location to comic book.");
  }
};

/**
 * Retrieves all locations associated with a specific comic book
 * @param comicBookId The ID of the comic book
 * @returns An array of ComicLocation objects associated with the comic book
 */
export const getLocationsByComicBookId = async (
  comicBookId: number,
): Promise<ComicLocation[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { comicLocation: ComicLocation }[] = await db
      .select({
        comicLocation: comicLocationsTable,
      })
      .from(comicLocationsTable)
      .innerJoin(
        comicBookLocationsTable,
        eq(
          comicLocationsTable.id,
          comicBookLocationsTable.comicLocationId,
        ),
      )
      .where(eq(comicBookLocationsTable.comicBookId, comicBookId));

    return result.map((row) => row.comicLocation);
  } catch (error) {
    console.error(
      "Error fetching comic locations by comic book ID:",
      error,
    );
    throw new Error("Failed to fetch comic locations.");
  }
};

/**
 * Searches for location IDs matching a filter string
 * @param filter The search filter string to match against location names (case-insensitive substring match)
 * @returns An array of location IDs that match the filter, or an empty array if no matches found
 */
export const getLocationIdsByFilter = async (
  filter: string,
): Promise<number[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .select({ id: comicLocationsTable.id })
      .from(comicLocationsTable)
      .where(ilike(comicLocationsTable.name, `%${filter}%`));

    return result.map((row) => row.id);
  } catch (error) {
    console.error("Error fetching comic location IDs by filter:", error);
    throw new Error("Failed to fetch comic location IDs.");
  }
};
