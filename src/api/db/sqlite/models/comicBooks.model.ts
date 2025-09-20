import { asc, desc, eq, sql, like, and, or, ilike } from "drizzle-orm";

import { getClient } from "../client.ts";

import { 
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
import type { ComicBook, NewComicBook } from "../../../types/index.ts";
import type { ComicBookQueryParams } from "../../../interfaces/RequestParams.interface.ts";

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



/**
 * Comprehensive query that JOINs all related metadata tables for efficient filtering and sorting
 * @param params Query parameters for filtering, sorting, and pagination
 * @returns A promise that resolves to an array of ComicBook objects with metadata
 */
export const getComicBooksWithMetadata = async (
  params: ComicBookQueryParams = {}
): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  // Destructure and set default values for query parameters from params
  const {
    offset = 0,
    limit = 20,
    titleFilter,
    seriesFilter,
    writerFilter,
    artistFilter,
    publisherFilter,
    genreFilter,
    characterFilter,
    yearFilter,
    generalFilter,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = params;

  try {
    // Now we build up any where conditions we may have based on the filters provided
    const whereConditions = [];

    if (titleFilter) {
      whereConditions.push(
        ilike(comicBooksTable.title, `%${titleFilter}%`)
      );
    }

    if (seriesFilter) {
      whereConditions.push(
        ilike(comicBooksTable.series, `%${seriesFilter}%`)
      );
    }

    if (writerFilter) {
      whereConditions.push(
        ilike(comicWritersTable.name, `%${writerFilter}%`)
      );
    }

    if (artistFilter) {
      whereConditions.push(
        or(
          ilike(comicPencillersTable.name, `%${artistFilter}%`),
          ilike(comicInkersTable.name, `%${artistFilter}%`),
          ilike(comicColoristsTable.name, `%${artistFilter}%`),
          ilike(comicCoverArtistsTable.name, `%${artistFilter}%`)
        )
      );
    }

    if (publisherFilter) {
      whereConditions.push(
        or(
          ilike(comicBooksTable.publisher, `%${publisherFilter}%`),
          ilike(comicPublishersTable.name, `%${publisherFilter}%`)
        )
      );
    }

    if (genreFilter) {
      whereConditions.push(
        ilike(comicGenresTable.name, `%${genreFilter}%`)
      );
    }

    if (characterFilter) {
      whereConditions.push(
        ilike(comicCharactersTable.name, `%${characterFilter}%`)
      );
    }

    if (yearFilter) {
      whereConditions.push(
        eq(comicBooksTable.year, yearFilter)
      );
    }

    if (generalFilter) {
      whereConditions.push(
        or(
          ilike(comicBooksTable.title, `%${generalFilter}%`),
          ilike(comicBooksTable.series, `%${generalFilter}%`),
          ilike(comicBooksTable.summary, `%${generalFilter}%`),
          ilike(comicWritersTable.name, `%${generalFilter}%`),
          ilike(comicPencillersTable.name, `%${generalFilter}%`),
          ilike(comicPublishersTable.name, `%${generalFilter}%`),
          ilike(comicGenresTable.name, `%${generalFilter}%`),
          ilike(comicCharactersTable.name, `%${generalFilter}%`)
        )
      );
    }

    // Then we determine sorting similar to before instead we define the value of orderByColumn dynamically
    let orderByColumn;
    switch (sortBy) {
      case 'title':
        orderByColumn = comicBooksTable.title;
        break;
      case 'series':
        orderByColumn = comicBooksTable.series;
        break;
      case 'issue_number':
        orderByColumn = comicBooksTable.issue_number;
        break;
      case 'publication_year':
        orderByColumn = comicBooksTable.year;
        break;
      case 'file_name':
        orderByColumn = comicBooksTable.file_path;
        break;
      case 'writer':
        orderByColumn = comicWritersTable.name;
        break;
      case 'publisher':
        orderByColumn = comicPublishersTable.name;
        break;
      case 'genre':
        orderByColumn = comicGenresTable.name;
        break;
      case 'created_at':
        orderByColumn = comicBooksTable.created_at;
        break;
      case 'updated_at':
        orderByColumn = comicBooksTable.updated_at;
        break;
      default:
        orderByColumn = comicBooksTable.created_at;
    }

    // Now we build up the query, joining the comic book table with all relevant metadata tables
    const baseQuery = db
      .selectDistinct({
        id: comicBooksTable.id,
        library_id: comicBooksTable.library_id,
        file_path: comicBooksTable.file_path,
        hash: comicBooksTable.hash,
        title: comicBooksTable.title,
        series: comicBooksTable.series,
        issue_number: comicBooksTable.issue_number,
        count: comicBooksTable.count,
        volume: comicBooksTable.volume,
        alternate_series: comicBooksTable.alternate_series,
        alternate_issue_number: comicBooksTable.alternate_issue_number,
        alternate_count: comicBooksTable.alternate_count,
        page_count: comicBooksTable.page_count,
        file_size: comicBooksTable.file_size,
        summary: comicBooksTable.summary,
        notes: comicBooksTable.notes,
        year: comicBooksTable.year,
        month: comicBooksTable.month,
        day: comicBooksTable.day,
        publisher: comicBooksTable.publisher,
        publication_date: comicBooksTable.publication_date,
        scan_info: comicBooksTable.scan_info,
        languge: comicBooksTable.languge,
        format: comicBooksTable.format,
        black_and_white: comicBooksTable.black_and_white,
        manga: comicBooksTable.manga,
        reading_direction: comicBooksTable.reading_direction,
        review: comicBooksTable.review,
        age_rating: comicBooksTable.age_rating,
        community_rating: comicBooksTable.community_rating,
        created_at: comicBooksTable.created_at,
        updated_at: comicBooksTable.updated_at,
      })
      .from(comicBooksTable)
      // Writers
      .leftJoin(
        comicBookWritersTable,
        eq(comicBooksTable.id, comicBookWritersTable.comic_book_id)
      )
      .leftJoin(
        comicWritersTable,
        eq(comicBookWritersTable.comic_writer_id, comicWritersTable.id)
      )
      // Pencillers
      .leftJoin(
        comicBookPencillersTable,
        eq(comicBooksTable.id, comicBookPencillersTable.comic_book_id)
      )
      .leftJoin(
        comicPencillersTable,
        eq(comicBookPencillersTable.comic_penciller_id, comicPencillersTable.id)
      )
      // Inkers
      .leftJoin(
        comicBookInkersTable,
        eq(comicBooksTable.id, comicBookInkersTable.comic_book_id)
      )
      .leftJoin(
        comicInkersTable,
        eq(comicBookInkersTable.comic_inker_id, comicInkersTable.id)
      )
      // Colorists
      .leftJoin(
        comicBookColoristsTable,
        eq(comicBooksTable.id, comicBookColoristsTable.comic_book_id)
      )
      .leftJoin(
        comicColoristsTable,
        eq(comicBookColoristsTable.comic_colorist_id, comicColoristsTable.id)
      )
      // Letterers
      .leftJoin(
        comicBookLetterersTable,
        eq(comicBooksTable.id, comicBookLetterersTable.comic_book_id)
      )
      .leftJoin(
        comicLetterersTable,
        eq(comicBookLetterersTable.comic_letterer_id, comicLetterersTable.id)
      )
      // Editors
      .leftJoin(
        comicBookEditorsTable,
        eq(comicBooksTable.id, comicBookEditorsTable.comic_book_id)
      )
      .leftJoin(
        comicEditorsTable,
        eq(comicBookEditorsTable.comic_editor_id, comicEditorsTable.id)
      )
      // Cover Artists
      .leftJoin(
        comicBookCoverArtistsTable,
        eq(comicBooksTable.id, comicBookCoverArtistsTable.comic_book_id)
      )
      .leftJoin(
        comicCoverArtistsTable,
        eq(comicBookCoverArtistsTable.comic_cover_artist_id, comicCoverArtistsTable.id)
      )
      // Publishers
      .leftJoin(
        comicBookPublishersTable,
        eq(comicBooksTable.id, comicBookPublishersTable.comic_book_id)
      )
      .leftJoin(
        comicPublishersTable,
        eq(comicBookPublishersTable.comic_publisher_id, comicPublishersTable.id)
      )
      // Imprints
      .leftJoin(
        comicBookImprintsTable,
        eq(comicBooksTable.id, comicBookImprintsTable.comic_book_id)
      )
      .leftJoin(
        comicImprintsTable,
        eq(comicBookImprintsTable.comic_imprint_id, comicImprintsTable.id)
      )
      // Genres
      .leftJoin(
        comicBookGenresTable,
        eq(comicBooksTable.id, comicBookGenresTable.comic_book_id)
      )
      .leftJoin(
        comicGenresTable,
        eq(comicBookGenresTable.comic_genre_id, comicGenresTable.id)
      )
      // Characters
      .leftJoin(
        comicBookCharactersTable,
        eq(comicBooksTable.id, comicBookCharactersTable.comic_book_id)
      )
      .leftJoin(
        comicCharactersTable,
        eq(comicBookCharactersTable.comic_character_id, comicCharactersTable.id)
      )
      // Teams
      .leftJoin(
        comicBookTeamsTable,
        eq(comicBooksTable.id, comicBookTeamsTable.comic_book_id)
      )
      .leftJoin(
        comicTeamsTable,
        eq(comicBookTeamsTable.comic_team_id, comicTeamsTable.id)
      )
      // Locations
      .leftJoin(
        comicBookLocationsTable,
        eq(comicBooksTable.id, comicBookLocationsTable.comic_book_id)
      )
      .leftJoin(
        comicLocationsTable,
        eq(comicBookLocationsTable.comic_location_id, comicLocationsTable.id)
      )
      // Story Arcs
      .leftJoin(
        comicBookStoryArcsTable,
        eq(comicBooksTable.id, comicBookStoryArcsTable.comic_book_id)
      )
      .leftJoin(
        comicStoryArcsTable,
        eq(comicBookStoryArcsTable.comic_story_arc_id, comicStoryArcsTable.id)
      )
      // Series Groups
      .leftJoin(
        comicBookSeriesGroupsTable,
        eq(comicBooksTable.id, comicBookSeriesGroupsTable.comic_book_id)
      )
      .leftJoin(
        comicSeriesGroupsTable,
        eq(comicBookSeriesGroupsTable.comic_series_group_id, comicSeriesGroupsTable.id)
      )
      .$dynamic();

    // Apply WHERE conditions if any
    const finalQuery = whereConditions.length > 0 
      ? baseQuery.where(and(...whereConditions))
      : baseQuery;

    // Apply ordering and pagination
    const result = await finalQuery
      .orderBy(sortOrder === 'asc' ? asc(orderByColumn) : desc(orderByColumn))
      .limit(limit)
      .offset(offset);

    return result;
  } catch (error) {
    console.error("Error fetching comic books with metadata:", error);
    throw error;
  }
};
