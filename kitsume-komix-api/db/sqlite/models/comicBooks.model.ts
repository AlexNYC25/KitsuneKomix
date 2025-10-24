import { asc, desc, eq, sql, and, or, ilike, inArray } from "drizzle-orm";

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
  comicSeriesBooksTable
} from "../schema.ts";
import type { 
  ComicBook, 
  NewComicBook,
  ComicBookFilteringAndSortingParams,
} from "../../../types/index.ts";
import { 
  // Constants (imported as values since they're used at runtime)
  COMIC_BOOK_INTERNAL_METADATA_PROPERTIES,
  COMIC_BOOK_EXTERNAL_METADATA_PROPERTIES,
} from "../../../types/index.ts";
import type { ComicBookQueryParams } from "../../../interfaces/RequestParams.interface.ts";


export const getComicBooksWithMetadataFilteringSoring = async (serviceDetails: ComicBookFilteringAndSortingParams): Promise<ComicBook[]> => {

  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database client is not initialized");
  }

  const whereConditions = [];
  
  // Determine which tables we need to join based on filters and sorting
  const requiredJoins = new Set<string>();
  
  // Check external filters to see which tables we need
  if (serviceDetails.externalFilters) {
    for (const filter of serviceDetails.externalFilters) {
      requiredJoins.add(filter.filterProperty);
      
      if (filter.filterProperty === "characters") {
        whereConditions.push(
          inArray(comicCharactersTable.id, filter.filterIds)
        );
      }

      if (filter.filterProperty === "colorists") {
        whereConditions.push(
          inArray(comicColoristsTable.id, filter.filterIds)
        );
      }

      if (filter.filterProperty === "cover_artists") {
        whereConditions.push(
          inArray(comicCoverArtistsTable.id, filter.filterIds)
        );
      }

      if (filter.filterProperty === "editors") {
        whereConditions.push(
          inArray(comicEditorsTable.id, filter.filterIds)
        );
      }

      if (filter.filterProperty === "genres") {
        whereConditions.push(
          inArray(comicGenresTable.id, filter.filterIds)
        );
      }

      if (filter.filterProperty === "imprints") {
        whereConditions.push(
          inArray(comicImprintsTable.id, filter.filterIds)
        );
      }

      if (filter.filterProperty === "inkers") {
        whereConditions.push(
          inArray(comicInkersTable.id, filter.filterIds)
        );
      }

      if (filter.filterProperty === "letterers") {
        whereConditions.push(
          inArray(comicLetterersTable.id, filter.filterIds)
        );
      }

      if (filter.filterProperty === "locations") {
        whereConditions.push(
          inArray(comicLocationsTable.id, filter.filterIds)
        );
      }

      if (filter.filterProperty === "pencillers") {
        whereConditions.push(
          inArray(comicPencillersTable.id, filter.filterIds)
        );
      }

      if (filter.filterProperty === "publishers") {
        whereConditions.push(
          inArray(comicPublishersTable.id, filter.filterIds)
        );
      }

      if (filter.filterProperty === "story_arcs") {
        whereConditions.push(
          inArray(comicStoryArcsTable.id, filter.filterIds)
        );
      }

      if (filter.filterProperty === "teams") {
        whereConditions.push(
          inArray(comicTeamsTable.id, filter.filterIds)
        );
      }

      if (filter.filterProperty === "writers") {
        whereConditions.push(
          inArray(comicWritersTable.id, filter.filterIds)
        );
      }
    }
  }

  // Check sort property to see if we need additional joins
  const sortProperty = serviceDetails.sort?.property || 'created_at';
  if (COMIC_BOOK_EXTERNAL_METADATA_PROPERTIES.includes(sortProperty as typeof COMIC_BOOK_EXTERNAL_METADATA_PROPERTIES[number])) {
    requiredJoins.add(sortProperty);
  }

  // Handle internal filters (these don't require joins)
  if (serviceDetails.internalFilters) {
    for (const filter of serviceDetails.internalFilters) {
      if (filter.filterProperty === "id") {
        whereConditions.push(
          eq(comicBooksTable.id, parseInt(filter.filterValue))
        );
      }

      if (filter.filterProperty === "title") {
        whereConditions.push(
          ilike(comicBooksTable.title, `%${filter.filterValue}%`)
        );
      }

      if (filter.filterProperty === "issue_number") {
        whereConditions.push(
          ilike(comicBooksTable.issue_number, `%${filter.filterValue}%`)
        );
      }

      if (filter.filterProperty === "volume") {
        whereConditions.push(
          ilike(comicBooksTable.volume, `%${filter.filterValue}%`)
        );
      }

      if (filter.filterProperty === "summary") {
        whereConditions.push(
          ilike(comicBooksTable.summary, `%${filter.filterValue}%`)
        );
      }

      if (filter.filterProperty === "series") {
        whereConditions.push(
          ilike(comicBooksTable.series, `%${filter.filterValue}%`)
        );
      }

      if (filter.filterProperty === "alternate_series") {
        whereConditions.push(
          ilike(comicBooksTable.alternate_series, `%${filter.filterValue}%`)
        );
      }

      if (filter.filterProperty === "alternate_issue_number") {
        whereConditions.push(
          ilike(comicBooksTable.alternate_issue_number, `%${filter.filterValue}%`)
        );
      }

      if (filter.filterProperty === "publication_date") {
        whereConditions.push(
          ilike(comicBooksTable.publication_date, `%${filter.filterValue}%`)
        );
      }

      if (filter.filterProperty === "created_at") {
        whereConditions.push(
          ilike(comicBooksTable.created_at, `%${filter.filterValue}%`)
        );
      }

      if (filter.filterProperty === "updated_at") {
        whereConditions.push(
          ilike(comicBooksTable.updated_at, `%${filter.filterValue}%`)
        );
      }
    }
  }

  // Start with base query
  const selectFields = {
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
    language: comicBooksTable.language,
    format: comicBooksTable.format,
    black_and_white: comicBooksTable.black_and_white,
    manga: comicBooksTable.manga,
    reading_direction: comicBooksTable.reading_direction,
    review: comicBooksTable.review,
    age_rating: comicBooksTable.age_rating,
    community_rating: comicBooksTable.community_rating,
    created_at: comicBooksTable.created_at,
    updated_at: comicBooksTable.updated_at,
  };

  // Build the query with only the required joins
  // deno-lint-ignore no-explicit-any
  let dynamicQuery: any = db.selectDistinct(selectFields).from(comicBooksTable);

  // Add joins conditionally
  if (requiredJoins.has("writers")) {
    dynamicQuery = dynamicQuery
      .leftJoin(
        comicBookWritersTable,
        eq(comicBooksTable.id, comicBookWritersTable.comic_book_id)
      )
      .leftJoin(
        comicWritersTable,
        eq(comicBookWritersTable.comic_writer_id, comicWritersTable.id)
      );
  }

  if (requiredJoins.has("pencillers")) {
    dynamicQuery = dynamicQuery
      .leftJoin(
        comicBookPencillersTable,
        eq(comicBooksTable.id, comicBookPencillersTable.comic_book_id)
      )
      .leftJoin(
        comicPencillersTable,
        eq(comicBookPencillersTable.comic_penciller_id, comicPencillersTable.id)
      );
  }

  if (requiredJoins.has("inkers")) {
    dynamicQuery = dynamicQuery
      .leftJoin(
        comicBookInkersTable,
        eq(comicBooksTable.id, comicBookInkersTable.comic_book_id)
      )
      .leftJoin(
        comicInkersTable,
        eq(comicBookInkersTable.comic_inker_id, comicInkersTable.id)
      );
  }

  if (requiredJoins.has("colorists")) {
    dynamicQuery = dynamicQuery
      .leftJoin(
        comicBookColoristsTable,
        eq(comicBooksTable.id, comicBookColoristsTable.comic_book_id)
      )
      .leftJoin(
        comicColoristsTable,
        eq(comicBookColoristsTable.comic_colorist_id, comicColoristsTable.id)
      );
  }

  if (requiredJoins.has("letterers")) {
    dynamicQuery = dynamicQuery
      .leftJoin(
        comicBookLetterersTable,
        eq(comicBooksTable.id, comicBookLetterersTable.comic_book_id)
      )
      .leftJoin(
        comicLetterersTable,
        eq(comicBookLetterersTable.comic_letterer_id, comicLetterersTable.id)
      );
  }

  if (requiredJoins.has("editors")) {
    dynamicQuery = dynamicQuery
      .leftJoin(
        comicBookEditorsTable,
        eq(comicBooksTable.id, comicBookEditorsTable.comic_book_id)
      )
      .leftJoin(
        comicEditorsTable,
        eq(comicBookEditorsTable.comic_editor_id, comicEditorsTable.id)
      );
  }

  if (requiredJoins.has("cover_artists")) {
    dynamicQuery = dynamicQuery
      .leftJoin(
        comicBookCoverArtistsTable,
        eq(comicBooksTable.id, comicBookCoverArtistsTable.comic_book_id)
      )
      .leftJoin(
        comicCoverArtistsTable,
        eq(comicBookCoverArtistsTable.comic_cover_artist_id, comicCoverArtistsTable.id)
      );
  }

  if (requiredJoins.has("publishers")) {
    dynamicQuery = dynamicQuery
      .leftJoin(
        comicBookPublishersTable,
        eq(comicBooksTable.id, comicBookPublishersTable.comic_book_id)
      )
      .leftJoin(
        comicPublishersTable,
        eq(comicBookPublishersTable.comic_publisher_id, comicPublishersTable.id)
      );
  }

  if (requiredJoins.has("imprints")) {
    dynamicQuery = dynamicQuery
      .leftJoin(
        comicBookImprintsTable,
        eq(comicBooksTable.id, comicBookImprintsTable.comic_book_id)
      )
      .leftJoin(
        comicImprintsTable,
        eq(comicBookImprintsTable.comic_imprint_id, comicImprintsTable.id)
      );
  }

  if (requiredJoins.has("genres")) {
    dynamicQuery = dynamicQuery
      .leftJoin(
        comicBookGenresTable,
        eq(comicBooksTable.id, comicBookGenresTable.comic_book_id)
      )
      .leftJoin(
        comicGenresTable,
        eq(comicBookGenresTable.comic_genre_id, comicGenresTable.id)
      );
  }

  if (requiredJoins.has("characters")) {
    dynamicQuery = dynamicQuery
      .leftJoin(
        comicBookCharactersTable,
        eq(comicBooksTable.id, comicBookCharactersTable.comic_book_id)
      )
      .leftJoin(
        comicCharactersTable,
        eq(comicBookCharactersTable.comic_character_id, comicCharactersTable.id)
      );
  }

  if (requiredJoins.has("teams")) {
    dynamicQuery = dynamicQuery
      .leftJoin(
        comicBookTeamsTable,
        eq(comicBooksTable.id, comicBookTeamsTable.comic_book_id)
      )
      .leftJoin(
        comicTeamsTable,
        eq(comicBookTeamsTable.comic_team_id, comicTeamsTable.id)
      );
  }

  if (requiredJoins.has("locations")) {
    dynamicQuery = dynamicQuery
      .leftJoin(
        comicBookLocationsTable,
        eq(comicBooksTable.id, comicBookLocationsTable.comic_book_id)
      )
      .leftJoin(
        comicLocationsTable,
        eq(comicBookLocationsTable.comic_location_id, comicLocationsTable.id)
      );
  }

  if (requiredJoins.has("story_arcs")) {
    dynamicQuery = dynamicQuery
      .leftJoin(
        comicBookStoryArcsTable,
        eq(comicBooksTable.id, comicBookStoryArcsTable.comic_book_id)
      )
      .leftJoin(
        comicStoryArcsTable,
        eq(comicBookStoryArcsTable.comic_story_arc_id, comicStoryArcsTable.id)
      );
  }

  if (requiredJoins.has("series_groups")) {
    dynamicQuery = dynamicQuery
      .leftJoin(
        comicBookSeriesGroupsTable,
        eq(comicBooksTable.id, comicBookSeriesGroupsTable.comic_book_id)
      )
      .leftJoin(
        comicSeriesGroupsTable,
        eq(comicBookSeriesGroupsTable.comic_series_group_id, comicSeriesGroupsTable.id)
      );
  }

    // Apply WHERE conditions if any exist  
    let finalQuery: typeof dynamicQuery;
    if (whereConditions.length > 0) {
      finalQuery = dynamicQuery.where(and(...whereConditions));
    } else {
      finalQuery = dynamicQuery;
    }

    // Handle sorting
    let orderByColumn;
    const sortOrder = serviceDetails.sort?.order || 'desc';

    // Determine the column to sort by based on property type
    if (COMIC_BOOK_INTERNAL_METADATA_PROPERTIES.includes(sortProperty as typeof COMIC_BOOK_INTERNAL_METADATA_PROPERTIES[number])) {
      // Internal properties - sort directly on comic_books table
      switch (sortProperty) {
        case 'id':
          orderByColumn = comicBooksTable.id;
          break;
        case 'title':
          orderByColumn = comicBooksTable.title;
          break;
        case 'issue_number':
          orderByColumn = comicBooksTable.issue_number;
          break;
        case 'volume':
          orderByColumn = comicBooksTable.volume;
          break;
        case 'summary':
          orderByColumn = comicBooksTable.summary;
          break;
        case 'series':
          orderByColumn = comicBooksTable.series;
          break;
        case 'alternate_series':
          orderByColumn = comicBooksTable.alternate_series;
          break;
        case 'alternate_issue_number':
          orderByColumn = comicBooksTable.alternate_issue_number;
          break;
        case 'publication_date':
          orderByColumn = comicBooksTable.publication_date;
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
    } else if (COMIC_BOOK_EXTERNAL_METADATA_PROPERTIES.includes(sortProperty as typeof COMIC_BOOK_EXTERNAL_METADATA_PROPERTIES[number])) {
      // External properties - sort on joined table columns (only if we actually joined the table)
      switch (sortProperty) {
        case 'characters':
          orderByColumn = requiredJoins.has('characters') ? comicCharactersTable.name : comicBooksTable.created_at;
          break;
        case 'colorists':
          orderByColumn = requiredJoins.has('colorists') ? comicColoristsTable.name : comicBooksTable.created_at;
          break;
        case 'cover_artists':
          orderByColumn = requiredJoins.has('cover_artists') ? comicCoverArtistsTable.name : comicBooksTable.created_at;
          break;
        case 'editors':
          orderByColumn = requiredJoins.has('editors') ? comicEditorsTable.name : comicBooksTable.created_at;
          break;
        case 'genres':
          orderByColumn = requiredJoins.has('genres') ? comicGenresTable.name : comicBooksTable.created_at;
          break;
        case 'imprints':
          orderByColumn = requiredJoins.has('imprints') ? comicImprintsTable.name : comicBooksTable.created_at;
          break;
        case 'inkers':
          orderByColumn = requiredJoins.has('inkers') ? comicInkersTable.name : comicBooksTable.created_at;
          break;
        case 'letterers':
          orderByColumn = requiredJoins.has('letterers') ? comicLetterersTable.name : comicBooksTable.created_at;
          break;
        case 'locations':
          orderByColumn = requiredJoins.has('locations') ? comicLocationsTable.name : comicBooksTable.created_at;
          break;
        case 'pencillers':
          orderByColumn = requiredJoins.has('pencillers') ? comicPencillersTable.name : comicBooksTable.created_at;
          break;
        case 'publishers':
          orderByColumn = requiredJoins.has('publishers') ? comicPublishersTable.name : comicBooksTable.created_at;
          break;
        case 'story_arcs':
          orderByColumn = requiredJoins.has('story_arcs') ? comicStoryArcsTable.name : comicBooksTable.created_at;
          break;
        case 'teams':
          orderByColumn = requiredJoins.has('teams') ? comicTeamsTable.name : comicBooksTable.created_at;
          break;
        case 'writers':
          orderByColumn = requiredJoins.has('writers') ? comicWritersTable.name : comicBooksTable.created_at;
          break;
        default:
          orderByColumn = comicBooksTable.created_at;
      }
    } else {
      // Fallback to default
      orderByColumn = comicBooksTable.created_at;
    }

    // Apply pagination defaults
    const offset = serviceDetails.offset || 0;
    const limit = serviceDetails.limit || 20;

    try {
      // Execute the query with sorting and pagination
      // Use selectDistinct to ensure one row per comic book ID
      const result = await finalQuery
        .orderBy(sortOrder === 'asc' ? asc(orderByColumn) : desc(orderByColumn))
        .limit(limit)
        .offset(offset);


      // TODO: here is where we attatch the metadata + convert the comicBook to comicBookWithMetadata

      return result;
    } catch (error) {
      console.error("Error fetching comic books with metadata filtering and sorting:", error);
      throw error;
    }
}

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
    if (updates.language !== undefined) updateData.language = updates.language; // Note: keeping schema typo
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

export const getComicBooksBySeriesId = async (
  seriesId: number,
): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = 
      await db
      .select(
        { id: comicBooksTable.id,
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
          language: comicBooksTable.language,
          format: comicBooksTable.format,
          black_and_white: comicBooksTable.black_and_white,
          manga: comicBooksTable.manga,
          reading_direction: comicBooksTable.reading_direction,
          review: comicBooksTable.review,
          age_rating: comicBooksTable.age_rating,
          community_rating: comicBooksTable.community_rating,
          created_at: comicBooksTable.created_at,
          updated_at: comicBooksTable.updated_at }
      )
      .from(comicBooksTable)
      .innerJoin(comicSeriesBooksTable, eq(comicBooksTable.id, comicSeriesBooksTable.comic_book_id))
      .where(eq(comicSeriesBooksTable.comic_series_id, seriesId))
      .orderBy(asc(comicBooksTable.issue_number));
      
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

export const getComicDuplicates = async (offset: number, limit: number): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select()
      .from(comicBooksTable)
      .groupBy(comicBooksTable.hash)
      .having(sql`COUNT(*) > 1`)
      .limit(limit)
      .offset(offset);
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
        language: comicBooksTable.language,
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
