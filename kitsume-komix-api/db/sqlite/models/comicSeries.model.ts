import { desc, eq, inArray, sql } from "drizzle-orm";

import { getClient } from "../client.ts";

import {
  comicBookCharactersTable,
  comicBookColoristsTable,
  comicBookCoverArtistsTable,
  comicBookEditorsTable,
  comicBookGenresTable,
  comicBookImprintsTable,
  comicBookInkersTable,
  comicBookLetterersTable,
  comicBookLocationsTable,
  comicBookPencillersTable,
  comicBookPublishersTable,
  comicBookSeriesGroupsTable,
  comicBooksTable,
  comicBookStoryArcsTable,
  comicBookTeamsTable,
  comicBookWritersTable,
  comicCharactersTable,
  comicColoristsTable,
  comicCoverArtistsTable,
  comicEditorsTable,
  comicGenresTable,
  comicImprintsTable,
  comicInkersTable,
  comicLetterersTable,
  comicLibrariesSeriesTable,
  comicLibrariesTable,
  comicLocationsTable,
  comicPencillersTable,
  comicPublishersTable,
  comicSeriesBooksTable,
  comicSeriesGroupsTable,
  comicSeriesTable,
  comicStoryArcsTable,
  comicTeamsTable,
  comicWritersTable,
} from "../schema.ts";
import type {
  ComicSeries,
  ComicSeriesWithMetadata,
  NewComicSeries,
} from "../../../types/index.ts";

export const insertComicSeries = async (
  seriesData: NewComicSeries,
): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicSeriesTable)
      .values(seriesData)
      .onConflictDoNothing()
      .returning({ id: comicSeriesTable.id });

    // If result is empty, it means the series already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing series by folder_path (which should be unique)
      if (seriesData.folderPath) {
        const existingSeries = await db
          .select({ id: comicSeriesTable.id })
          .from(comicSeriesTable)
          .where(eq(comicSeriesTable.folderPath, seriesData.folderPath));
        if (existingSeries.length > 0) {
          console.log(
            `Comic series already exists at path: ${seriesData.folderPath}, returning existing ID: ${
              existingSeries[0].id
            }`,
          );
          return existingSeries[0].id;
        }
      }

      /*
      // If we can't find by folder_path, try by name
      if (seriesData.name) {
        const existingSeriesByName = await db
          .select({ id: comicSeriesTable.id })
          .from(comicSeriesTable)
          .where(eq(comicSeriesTable.name, seriesData.name));

        if (existingSeriesByName.length > 0) {
          console.log(`Comic series already exists with name: ${seriesData.name}, returning existing ID: ${existingSeriesByName[0].id}`);
          return existingSeriesByName[0].id;
        }
      }
      */

      throw new Error(
        `Failed to insert comic series and could not find existing series. Data: ${
          JSON.stringify(seriesData)
        }`,
      );
    }

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic series:", error);
    throw error;
  }
};

export const insertComicSeriesIntoLibrary = async (
  seriesId: number,
  libraryId: number,
): Promise<boolean> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicLibrariesSeriesTable)
      .values({
        comicSeriesId: seriesId,
        libraryId: libraryId,
      })
      .onConflictDoNothing()
      .returning({ id: comicLibrariesSeriesTable.id });

    return result.length > 0;
  } catch (error) {
    console.error("Error inserting comic series into library:", error);
    throw error;
  }
};

export const getComicSeriesById = async (
  id: number,
): Promise<ComicSeries | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicSeriesTable).where(
      eq(comicSeriesTable.id, id),
    );
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching comic series by ID:", error);
    throw error;
  }
};

/**
 * Get the metadata for a comic series by its ID by compiling it from the comic books under it
 * @param id The ID of the comic series to retrieve metadata for.
 * @returns The metadata of the comic series or null if not found.
 */
export const getComicSeriesMetadataById = async (
  id: number,
): Promise<ComicSeriesWithMetadata | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select({
        id: comicSeriesTable.id,
        name: comicSeriesTable.name,
        description: comicSeriesTable.description,
        folderPath: comicSeriesTable.folderPath,
        createdAt: comicSeriesTable.createdAt,
        updatedAt: comicSeriesTable.updatedAt,
        writers: sql<string>`GROUP_CONCAT(DISTINCT ${comicWritersTable}.name)`,
        pencillers: sql<
          string
        >`GROUP_CONCAT(DISTINCT ${comicPencillersTable}.name)`,
        inkers: sql<string>`GROUP_CONCAT(DISTINCT ${comicInkersTable}.name)`,
        colorists: sql<
          string
        >`GROUP_CONCAT(DISTINCT ${comicColoristsTable}.name)`,
        letterers: sql<
          string
        >`GROUP_CONCAT(DISTINCT ${comicLetterersTable}.name)`,
        editors: sql<string>`GROUP_CONCAT(DISTINCT ${comicEditorsTable}.name)`,
        cover_artists: sql<
          string
        >`GROUP_CONCAT(DISTINCT ${comicCoverArtistsTable}.name)`,
        publishers: sql<
          string
        >`GROUP_CONCAT(DISTINCT ${comicPublishersTable}.name)`,
        imprints: sql<
          string
        >`GROUP_CONCAT(DISTINCT ${comicImprintsTable}.name)`,
        genres: sql<string>`GROUP_CONCAT(DISTINCT ${comicGenresTable}.name)`,
        characters: sql<
          string
        >`GROUP_CONCAT(DISTINCT ${comicCharactersTable}.name)`,
        teams: sql<string>`GROUP_CONCAT(DISTINCT ${comicTeamsTable}.name)`,
        locations: sql<
          string
        >`GROUP_CONCAT(DISTINCT ${comicLocationsTable}.name)`,
        story_arcs: sql<
          string
        >`GROUP_CONCAT(DISTINCT ${comicStoryArcsTable}.name)`,
        series_groups: sql<
          string
        >`GROUP_CONCAT(DISTINCT ${comicSeriesGroupsTable}.name)`,
      })
      .from(comicSeriesTable)
      .leftJoin(
        comicSeriesBooksTable,
        eq(comicSeriesTable.id, comicSeriesBooksTable.comicSeriesId),
      )
      .leftJoin(
        comicBooksTable,
        eq(comicSeriesBooksTable.comicBookId, comicBooksTable.id),
      )
      .leftJoin(
        comicBookWritersTable,
        eq(comicBooksTable.id, comicBookWritersTable.comicBookId),
      )
      .leftJoin(
        comicWritersTable,
        eq(comicBookWritersTable.comicWriterId, comicWritersTable.id),
      )
      .leftJoin(
        comicBookPencillersTable,
        eq(comicBooksTable.id, comicBookPencillersTable.comicBookId),
      )
      .leftJoin(
        comicPencillersTable,
        eq(
          comicBookPencillersTable.comicPencillerId,
          comicPencillersTable.id,
        ),
      )
      .leftJoin(
        comicBookInkersTable,
        eq(comicBooksTable.id, comicBookInkersTable.comicBookId),
      )
      .leftJoin(
        comicInkersTable,
        eq(comicBookInkersTable.comicInkerId, comicInkersTable.id),
      )
      .leftJoin(
        comicBookColoristsTable,
        eq(comicBooksTable.id, comicBookColoristsTable.comicBookId),
      )
      .leftJoin(
        comicColoristsTable,
        eq(comicBookColoristsTable.comicColoristId, comicColoristsTable.id),
      )
      .leftJoin(
        comicBookLetterersTable,
        eq(comicBooksTable.id, comicBookLetterersTable.comicBookId),
      )
      .leftJoin(
        comicLetterersTable,
        eq(comicBookLetterersTable.comicLetterId, comicLetterersTable.id),
      )
      .leftJoin(
        comicBookEditorsTable,
        eq(comicBooksTable.id, comicBookEditorsTable.comicBookId),
      )
      .leftJoin(
        comicEditorsTable,
        eq(comicBookEditorsTable.comicEditorId, comicEditorsTable.id),
      )
      .leftJoin(
        comicBookCoverArtistsTable,
        eq(comicBooksTable.id, comicBookCoverArtistsTable.comicBookId),
      )
      .leftJoin(
        comicCoverArtistsTable,
        eq(
          comicBookCoverArtistsTable.comicCoverArtistId,
          comicCoverArtistsTable.id,
        ),
      )
      .leftJoin(
        comicBookPublishersTable,
        eq(comicBooksTable.id, comicBookPublishersTable.comicBookId),
      )
      .leftJoin(
        comicPublishersTable,
        eq(
          comicBookPublishersTable.comicPublisherId,
          comicPublishersTable.id,
        ),
      )
      .leftJoin(
        comicBookImprintsTable,
        eq(comicBooksTable.id, comicBookImprintsTable.comicBookId),
      )
      .leftJoin(
        comicImprintsTable,
        eq(comicBookImprintsTable.comicImprintId, comicImprintsTable.id),
      )
      .leftJoin(
        comicBookGenresTable,
        eq(comicBooksTable.id, comicBookGenresTable.comicBookId),
      )
      .leftJoin(
        comicGenresTable,
        eq(comicBookGenresTable.comicGenreId, comicGenresTable.id),
      )
      .leftJoin(
        comicBookCharactersTable,
        eq(comicBooksTable.id, comicBookCharactersTable.comicBookId),
      )
      .leftJoin(
        comicCharactersTable,
        eq(
          comicBookCharactersTable.comicCharacterId,
          comicCharactersTable.id,
        ),
      )
      .leftJoin(
        comicBookTeamsTable,
        eq(comicBooksTable.id, comicBookTeamsTable.comicBookId),
      )
      .leftJoin(
        comicTeamsTable,
        eq(comicBookTeamsTable.comicTeamId, comicTeamsTable.id),
      )
      .leftJoin(
        comicBookLocationsTable,
        eq(comicBooksTable.id, comicBookLocationsTable.comicBookId),
      )
      .leftJoin(
        comicLocationsTable,
        eq(comicBookLocationsTable.comicLocationId, comicLocationsTable.id),
      )
      .leftJoin(
        comicBookStoryArcsTable,
        eq(comicBooksTable.id, comicBookStoryArcsTable.comicBookId),
      )
      .leftJoin(
        comicStoryArcsTable,
        eq(comicBookStoryArcsTable.comicStoryArcId, comicStoryArcsTable.id),
      )
      .leftJoin(
        comicBookSeriesGroupsTable,
        eq(comicBooksTable.id, comicBookSeriesGroupsTable.comicBookId),
      )
      .leftJoin(
        comicSeriesGroupsTable,
        eq(
          comicBookSeriesGroupsTable.comicSeriesGroupId,
          comicSeriesGroupsTable.id,
        ),
      )
      .where(eq(comicSeriesTable.id, id))
      .groupBy(comicSeriesTable.id);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching comic series metadata by ID:", error);
    throw error;
  }
};

export const getComicSeriesByName = async (
  name: string,
): Promise<ComicSeries | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicSeriesTable).where(
      eq(comicSeriesTable.name, name),
    );
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching comic series by name:", error);
    throw error;
  }
};

export const getComicSeriesByPath = async (
  folderPath: string,
): Promise<ComicSeries | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicSeriesTable).where(
      eq(comicSeriesTable.folderPath, folderPath),
    );
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching comic series by path:", error);
    throw error;
  }
};

export const getAllComicSeries = async (): Promise<ComicSeries[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicSeriesTable);
    return result;
  } catch (error) {
    console.error("Error fetching all comic series:", error);
    throw error;
  }
};

export const getLatestComicSeries = async (
  limit: number,
  offset: number = 0,
  libraryIds?: number[],
): Promise<ComicSeries[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select(
        {
          id: comicSeriesTable.id,
          name: comicSeriesTable.name,
          description: comicSeriesTable.description,
          folderPath: comicSeriesTable.folderPath,
          createdAt: comicSeriesTable.createdAt,
          updatedAt: comicSeriesTable.updatedAt,
        },
      )
      .from(comicSeriesTable)
      .leftJoin(
        comicLibrariesSeriesTable,
        eq(comicSeriesTable.id, comicLibrariesSeriesTable.comicSeriesId),
      )
      .leftJoin(
        comicLibrariesTable,
        eq(comicLibrariesSeriesTable.libraryId, comicLibrariesTable.id),
      )
      .where(
        libraryIds && libraryIds.length > 0
          ? inArray(comicLibrariesTable.id, libraryIds)
          : undefined,
      )
      .groupBy(comicSeriesTable.id)
      .orderBy(desc(comicSeriesTable.createdAt))
      .limit(limit)
      .offset(offset);
    return result;
  } catch (error) {
    console.error("Error fetching latest comic series:", error);
    throw error;
  }
};

export const getUpdatedComicSeries = async (
  limit: number,
  offset: number = 0,
  libraryIds?: number[],
): Promise<ComicSeries[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select(
        {
          id: comicSeriesTable.id,
          name: comicSeriesTable.name,
          description: comicSeriesTable.description,
          folderPath: comicSeriesTable.folderPath,
          createdAt: comicSeriesTable.createdAt,
          updatedAt: comicSeriesTable.updatedAt,
        },
      )
      .from(comicSeriesTable)
      .leftJoin(
        comicLibrariesSeriesTable,
        eq(comicSeriesTable.id, comicLibrariesSeriesTable.comicSeriesId),
      )
      .leftJoin(
        comicLibrariesTable,
        eq(comicLibrariesSeriesTable.libraryId, comicLibrariesTable.id),
      )
      .leftJoin(
        comicSeriesBooksTable,
        eq(comicSeriesTable.id, comicSeriesBooksTable.comicSeriesId),
      )
      .leftJoin(
        comicBooksTable,
        eq(comicSeriesBooksTable.comicBookId, comicBooksTable.id),
      )
      .where(
        libraryIds && libraryIds.length > 0
          ? inArray(comicLibrariesTable.id, libraryIds)
          : undefined,
      )
      .groupBy(comicSeriesTable.id)
      .orderBy(desc(comicBooksTable.updatedAt))
      .limit(limit)
      .offset(offset);
    return result;
  } catch (error) {
    console.error("Error fetching updated comic series:", error);
    throw error;
  }
};

export const updateComicSeries = async (
  id: number,
  updates: Partial<NewComicSeries>,
): Promise<boolean> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) {
      updateData.description = updates.description;
    }
    if (updates.folderPath !== undefined) {
      updateData.folderPath = updates.folderPath;
    }

    if (Object.keys(updateData).length === 0) {
      return false;
    }

    const result = await db
      .update(comicSeriesTable)
      .set(updateData)
      .where(eq(comicSeriesTable.id, id))
      .returning({ id: comicSeriesTable.id });

    return result.length > 0;
  } catch (error) {
    console.error("Error updating comic series:", error);
    throw error;
  }
};

export const deleteComicSeries = async (id: number): Promise<boolean> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .delete(comicSeriesTable)
      .where(eq(comicSeriesTable.id, id))
      .returning({ id: comicSeriesTable.id });

    return result.length > 0;
  } catch (error) {
    console.error("Error deleting comic series:", error);
    throw error;
  }
};

export const addComicBookToSeries = async (
  seriesId: number,
  comicBookId: number,
): Promise<boolean> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicSeriesBooksTable)
      .values({
        comicSeriesId: seriesId,
        comicBookId: comicBookId,
      })
      .onConflictDoNothing()
      .returning({ id: comicSeriesBooksTable.id });

    return result.length > 0;
  } catch (error) {
    console.error("Error adding comic book to series:", error);
    throw error;
  }
};

export const getComicBooksInSeries = async (
  seriesId: number,
): Promise<number[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select()
      .from(comicSeriesBooksTable)
      .where(eq(comicSeriesBooksTable.comicSeriesId, seriesId));

    // Return the comicBookId (the linked comic book) for all association rows
    return result.map((row) => row.comicBookId);
  } catch (error) {
    console.error("Error fetching comic books in series:", error);
    throw error;
  }
};

export const getSeriesIdFromComicBook = async (
  comicBookId: number,
): Promise<number | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select()
      .from(comicSeriesBooksTable)
      .where(eq(comicSeriesBooksTable.comicBookId, comicBookId));

    return result.length > 0 ? result[0].comicSeriesId : null;
  } catch (error) {
    console.error("Error fetching series ID from comic book ID:", error);
    throw error;
  }
};
