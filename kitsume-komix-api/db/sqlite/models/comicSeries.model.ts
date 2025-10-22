import { eq, desc, inArray, sql } from "drizzle-orm";

import { getClient } from "../client.ts";

import { 
  comicSeriesBooksTable, 
  comicSeriesTable, 
  comicLibrariesTable, 
  comicLibrariesSeriesTable, 
  comicBooksTable,
  comicBookWritersTable,
  comicWritersTable,
  comicBookPencillersTable,
  comicPencillersTable,
  comicBookInkersTable,
  comicInkersTable,
  comicBookColoristsTable,
  comicColoristsTable,
  comicBookLetterersTable,
  comicLetterersTable,
  comicBookEditorsTable,
  comicEditorsTable,
  comicBookCoverArtistsTable,
  comicCoverArtistsTable,
  comicBookPublishersTable,
  comicPublishersTable,
  comicBookImprintsTable,
  comicImprintsTable,
  comicBookGenresTable,
  comicGenresTable,
  comicBookCharactersTable,
  comicCharactersTable,
  comicBookTeamsTable,
  comicTeamsTable,
  comicBookLocationsTable,
  comicLocationsTable,
  comicBookStoryArcsTable,
  comicStoryArcsTable,
  comicBookSeriesGroupsTable,
  comicSeriesGroupsTable,
} from "../schema.ts";
import type { ComicSeries, NewComicSeries, ComicSeriesWithMetadata } from "../../../types/index.ts";

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
      if (seriesData.folder_path) {
        const existingSeries = await db
          .select({ id: comicSeriesTable.id })
          .from(comicSeriesTable)
          .where(eq(comicSeriesTable.folder_path, seriesData.folder_path));

        if (existingSeries.length > 0) {
          console.log(
            `Comic series already exists at path: ${seriesData.folder_path}, returning existing ID: ${
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
        comic_series_id: seriesId,
        library_id: libraryId,
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
        folder_path: comicSeriesTable.folder_path,
        created_at: comicSeriesTable.created_at,
        updated_at: comicSeriesTable.updated_at,
        writers: sql<string>`GROUP_CONCAT(DISTINCT ${comicWritersTable}.name)`,
        pencillers: sql<string>`GROUP_CONCAT(DISTINCT ${comicPencillersTable}.name)`,
        inkers: sql<string>`GROUP_CONCAT(DISTINCT ${comicInkersTable}.name)`,
        colorists: sql<string>`GROUP_CONCAT(DISTINCT ${comicColoristsTable}.name)`,
        letterers: sql<string>`GROUP_CONCAT(DISTINCT ${comicLetterersTable}.name)`,
        editors: sql<string>`GROUP_CONCAT(DISTINCT ${comicEditorsTable}.name)`,
        cover_artists: sql<string>`GROUP_CONCAT(DISTINCT ${comicCoverArtistsTable}.name)`,
        publishers: sql<string>`GROUP_CONCAT(DISTINCT ${comicPublishersTable}.name)`,
        imprints: sql<string>`GROUP_CONCAT(DISTINCT ${comicImprintsTable}.name)`,
        genres: sql<string>`GROUP_CONCAT(DISTINCT ${comicGenresTable}.name)`,
        characters: sql<string>`GROUP_CONCAT(DISTINCT ${comicCharactersTable}.name)`,
        teams: sql<string>`GROUP_CONCAT(DISTINCT ${comicTeamsTable}.name)`,
        locations: sql<string>`GROUP_CONCAT(DISTINCT ${comicLocationsTable}.name)`,
        story_arcs: sql<string>`GROUP_CONCAT(DISTINCT ${comicStoryArcsTable}.name)`,
        series_groups: sql<string>`GROUP_CONCAT(DISTINCT ${comicSeriesGroupsTable}.name)`,
      })
      .from(comicSeriesTable)
      .leftJoin(
        comicSeriesBooksTable,
        eq(comicSeriesTable.id, comicSeriesBooksTable.comic_series_id)
      )
      .leftJoin(
        comicBooksTable,
        eq(comicSeriesBooksTable.comic_book_id, comicBooksTable.id)
      )
      .leftJoin(
        comicBookWritersTable,
        eq(comicBooksTable.id, comicBookWritersTable.comic_book_id)
      )
      .leftJoin(
        comicWritersTable,
        eq(comicBookWritersTable.comic_writer_id, comicWritersTable.id)
      )
      .leftJoin(
        comicBookPencillersTable,
        eq(comicBooksTable.id, comicBookPencillersTable.comic_book_id)
      )
      .leftJoin(
        comicPencillersTable,
        eq(comicBookPencillersTable.comic_penciller_id, comicPencillersTable.id)
      )
      .leftJoin(
        comicBookInkersTable,
        eq(comicBooksTable.id, comicBookInkersTable.comic_book_id)
      )
      .leftJoin(
        comicInkersTable,
        eq(comicBookInkersTable.comic_inker_id, comicInkersTable.id)
      )
      .leftJoin(
        comicBookColoristsTable,
        eq(comicBooksTable.id, comicBookColoristsTable.comic_book_id)
      )
      .leftJoin(
        comicColoristsTable,
        eq(comicBookColoristsTable.comic_colorist_id, comicColoristsTable.id)
      )
      .leftJoin(
        comicBookLetterersTable,
        eq(comicBooksTable.id, comicBookLetterersTable.comic_book_id)
      )
      .leftJoin(
        comicLetterersTable,
        eq(comicBookLetterersTable.comic_letterer_id, comicLetterersTable.id)
      )
      .leftJoin(
        comicBookEditorsTable,
        eq(comicBooksTable.id, comicBookEditorsTable.comic_book_id)
      )
      .leftJoin(
        comicEditorsTable,
        eq(comicBookEditorsTable.comic_editor_id, comicEditorsTable.id)
      )
      .leftJoin(
        comicBookCoverArtistsTable,
        eq(comicBooksTable.id, comicBookCoverArtistsTable.comic_book_id)
      )
      .leftJoin(
        comicCoverArtistsTable,
        eq(comicBookCoverArtistsTable.comic_cover_artist_id, comicCoverArtistsTable.id)
      )
      .leftJoin(
        comicBookPublishersTable,
        eq(comicBooksTable.id, comicBookPublishersTable.comic_book_id)
      )
      .leftJoin(
        comicPublishersTable,
        eq(comicBookPublishersTable.comic_publisher_id, comicPublishersTable.id)
      )
      .leftJoin(
        comicBookImprintsTable,
        eq(comicBooksTable.id, comicBookImprintsTable.comic_book_id)
      )
      .leftJoin(
        comicImprintsTable,
        eq(comicBookImprintsTable.comic_imprint_id, comicImprintsTable.id)
      )
      .leftJoin(
        comicBookGenresTable,
        eq(comicBooksTable.id, comicBookGenresTable.comic_book_id)
      )
      .leftJoin(
        comicGenresTable,
        eq(comicBookGenresTable.comic_genre_id, comicGenresTable.id)
      )
      .leftJoin(
        comicBookCharactersTable,
        eq(comicBooksTable.id, comicBookCharactersTable.comic_book_id)
      )
      .leftJoin(
        comicCharactersTable,
        eq(comicBookCharactersTable.comic_character_id, comicCharactersTable.id)
      )
      .leftJoin(
        comicBookTeamsTable,
        eq(comicBooksTable.id, comicBookTeamsTable.comic_book_id)
      )
      .leftJoin(
        comicTeamsTable,
        eq(comicBookTeamsTable.comic_team_id, comicTeamsTable.id)
      )
      .leftJoin(
        comicBookLocationsTable,
        eq(comicBooksTable.id, comicBookLocationsTable.comic_book_id)
      )
      .leftJoin(
        comicLocationsTable,
        eq(comicBookLocationsTable.comic_location_id, comicLocationsTable.id)
      )
      .leftJoin(
        comicBookStoryArcsTable,
        eq(comicBooksTable.id, comicBookStoryArcsTable.comic_book_id)
      )
      .leftJoin(
        comicStoryArcsTable,
        eq(comicBookStoryArcsTable.comic_story_arc_id, comicStoryArcsTable.id)
      )
      .leftJoin(
        comicBookSeriesGroupsTable,
        eq(comicBooksTable.id, comicBookSeriesGroupsTable.comic_book_id)
      )
      .leftJoin(
        comicSeriesGroupsTable,
        eq(comicBookSeriesGroupsTable.comic_series_group_id, comicSeriesGroupsTable.id)
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
      eq(comicSeriesTable.folder_path, folderPath),
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
          folder_path: comicSeriesTable.folder_path,
          created_at: comicSeriesTable.created_at,
          updated_at: comicSeriesTable.updated_at,
        }
      )
      .from(comicSeriesTable)
      .leftJoin(comicLibrariesSeriesTable, eq(comicSeriesTable.id, comicLibrariesSeriesTable.comic_series_id))
      .leftJoin(comicLibrariesTable, eq(comicLibrariesSeriesTable.library_id, comicLibrariesTable.id))
      .where(
        libraryIds && libraryIds.length > 0
          ? inArray(comicLibrariesTable.id, libraryIds)
          : undefined,
      )
      .groupBy(comicSeriesTable.id)
      .orderBy(desc(comicSeriesTable.created_at))
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
          folder_path: comicSeriesTable.folder_path,
          created_at: comicSeriesTable.created_at,
          updated_at: comicSeriesTable.updated_at,
        }
      )
      .from(comicSeriesTable)
      .leftJoin(comicLibrariesSeriesTable, eq(comicSeriesTable.id, comicLibrariesSeriesTable.comic_series_id))
      .leftJoin(comicLibrariesTable, eq(comicLibrariesSeriesTable.library_id, comicLibrariesTable.id))
      .leftJoin(comicSeriesBooksTable, eq(comicSeriesTable.id, comicSeriesBooksTable.comic_series_id))
      .leftJoin(comicBooksTable, eq(comicSeriesBooksTable.comic_book_id, comicBooksTable.id))
      .where(
        libraryIds && libraryIds.length > 0
          ? inArray(comicLibrariesTable.id, libraryIds)
          : undefined,
      )
      .groupBy(comicSeriesTable.id)
      .orderBy(desc(comicBooksTable.updated_at))
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
    if (updates.folder_path !== undefined) {
      updateData.folder_path = updates.folder_path;
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
        comic_series_id: seriesId,
        comic_book_id: comicBookId,
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
      .where(eq(comicSeriesBooksTable.comic_series_id, seriesId));

    return result.map((row) => row.id);
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
      .where(eq(comicSeriesBooksTable.comic_book_id, comicBookId));

    return result.length > 0 ? result[0].comic_series_id : null;
  } catch (error) {
    console.error("Error fetching series ID from comic book ID:", error);
    throw error;
  }
};
