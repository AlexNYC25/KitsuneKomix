import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";

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
  comicLocationsTable,
  comicPencillersTable,
  comicPublishersTable,
  comicSeriesBooksTable,
  comicSeriesGroupsTable,
  comicStoryArcsTable,
  comicTeamsTable,
  comicWritersTable,
} from "../schema.ts";

import type {
  ComicBook,
  ComicBookFilteringAndSortingParams,
  NewComicBook
} from "#types/index.ts";
import type { ComicBookQueryParams } from "#interfaces/index.ts";

import {
  COMIC_BOOK_EXTERNAL_METADATA_PROPERTIES,
  COMIC_BOOK_INTERNAL_METADATA_PROPERTIES,
} from "#utilities/constants.ts";
import { SQLiteColumn } from "drizzle-orm/sqlite-core";

/**
 * Gets comic books with metadata filtering and sorting
 * @param serviceDetails - Filtering and sorting parameters
 * @returns Promise resolving to an array of ComicBook objects 
 */
export const getComicBooksWithMetadataFilteringSorting = async (
  serviceDetails: ComicBookFilteringAndSortingParams,
): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database client is not initialized");
  }

  const whereConditions: Array<ReturnType<typeof eq> | ReturnType<typeof inArray> | ReturnType<typeof ilike>> = [];

  // Determine which tables we need to join based on filters and sorting
  const requiredJoins = new Set<string>();

  // Check external filters to see which tables we need
  if (serviceDetails.externalFilters) {
    for (const filter of serviceDetails.externalFilters) {
      requiredJoins.add(filter.filterProperty);

      if (filter.filterProperty === "characters") {
        whereConditions.push(
          inArray(comicCharactersTable.id, filter.filterIds),
        );
      }

      if (filter.filterProperty === "colorists") {
        whereConditions.push(
          inArray(comicColoristsTable.id, filter.filterIds),
        );
      }

      if (filter.filterProperty === "cover_artists") {
        whereConditions.push(
          inArray(comicCoverArtistsTable.id, filter.filterIds),
        );
      }

      if (filter.filterProperty === "editors") {
        whereConditions.push(
          inArray(comicEditorsTable.id, filter.filterIds),
        );
      }

      if (filter.filterProperty === "genres") {
        whereConditions.push(
          inArray(comicGenresTable.id, filter.filterIds),
        );
      }

      if (filter.filterProperty === "imprints") {
        whereConditions.push(
          inArray(comicImprintsTable.id, filter.filterIds),
        );
      }

      if (filter.filterProperty === "inkers") {
        whereConditions.push(
          inArray(comicInkersTable.id, filter.filterIds),
        );
      }

      if (filter.filterProperty === "letterers") {
        whereConditions.push(
          inArray(comicLetterersTable.id, filter.filterIds),
        );
      }

      if (filter.filterProperty === "locations") {
        whereConditions.push(
          inArray(comicLocationsTable.id, filter.filterIds),
        );
      }

      if (filter.filterProperty === "pencillers") {
        whereConditions.push(
          inArray(comicPencillersTable.id, filter.filterIds),
        );
      }

      if (filter.filterProperty === "publishers") {
        whereConditions.push(
          inArray(comicPublishersTable.id, filter.filterIds),
        );
      }

      if (filter.filterProperty === "story_arcs") {
        whereConditions.push(
          inArray(comicStoryArcsTable.id, filter.filterIds),
        );
      }

      if (filter.filterProperty === "teams") {
        whereConditions.push(
          inArray(comicTeamsTable.id, filter.filterIds),
        );
      }

      if (filter.filterProperty === "writers") {
        whereConditions.push(
          inArray(comicWritersTable.id, filter.filterIds),
        );
      }
    }
  }

  // Check sort property to see if we need additional joins
  const sortProperty = serviceDetails.sort?.property || "created_at";
  if (
    COMIC_BOOK_EXTERNAL_METADATA_PROPERTIES.includes(
      sortProperty as typeof COMIC_BOOK_EXTERNAL_METADATA_PROPERTIES[number],
    )
  ) {
    requiredJoins.add(sortProperty);
  }

  // Handle internal filters (these don't require joins)
  if (serviceDetails.internalFilters) {
    for (const filter of serviceDetails.internalFilters) {
      if (filter.filterProperty === "id") {
        whereConditions.push(
          eq(comicBooksTable.id, parseInt(filter.filterValue)),
        );
      }

      if (filter.filterProperty === "title") {
        whereConditions.push(
          ilike(comicBooksTable.title, `%${filter.filterValue}%`),
        );
      }

      if (filter.filterProperty === "issue_number") {
        whereConditions.push(
          ilike(comicBooksTable.issueNumber, `%${filter.filterValue}%`),
        );
      }

      if (filter.filterProperty === "volume") {
        whereConditions.push(
          ilike(comicBooksTable.volume, `%${filter.filterValue}%`),
        );
      }

      if (filter.filterProperty === "summary") {
        whereConditions.push(
          ilike(comicBooksTable.summary, `%${filter.filterValue}%`),
        );
      }

      if (filter.filterProperty === "series") {
        whereConditions.push(
          ilike(comicBooksTable.series, `%${filter.filterValue}%`),
        );
      }

      if (filter.filterProperty === "alternate_series") {
        whereConditions.push(
          ilike(comicBooksTable.alternateSeries, `%${filter.filterValue}%`),
        );
      }

      if (filter.filterProperty === "alternate_issue_number") {
        whereConditions.push(
          ilike(
            comicBooksTable.alternateIssueNumber,
            `%${filter.filterValue}%`,
          ),
        );
      }

      if (filter.filterProperty === "publication_date") {
        whereConditions.push(
          ilike(comicBooksTable.publicationDate, `%${filter.filterValue}%`),
        );
      }

      if (filter.filterProperty === "created_at") {
        whereConditions.push(
          ilike(comicBooksTable.createdAt, `%${filter.filterValue}%`),
        );
      }

      if (filter.filterProperty === "updated_at") {
        whereConditions.push(
          ilike(comicBooksTable.updatedAt, `%${filter.filterValue}%`),
        );
      }
    }
  }

  // Start with base query
  const selectFields = {
    id: comicBooksTable.id,
    libraryId: comicBooksTable.libraryId,
    filePath: comicBooksTable.filePath,
    hash: comicBooksTable.hash,
    title: comicBooksTable.title,
    series: comicBooksTable.series,
    issueNumber: comicBooksTable.issueNumber,
    count: comicBooksTable.count,
    volume: comicBooksTable.volume,
    alternateSeries: comicBooksTable.alternateSeries,
    alternateIssueNumber: comicBooksTable.alternateIssueNumber,
    alternateCount: comicBooksTable.alternateCount,
    pageCount: comicBooksTable.pageCount,
    fileSize: comicBooksTable.fileSize,
    summary: comicBooksTable.summary,
    notes: comicBooksTable.notes,
    year: comicBooksTable.year,
    month: comicBooksTable.month,
    day: comicBooksTable.day,
    publisher: comicBooksTable.publisher,
    publicationDate: comicBooksTable.publicationDate,
    scanInfo: comicBooksTable.scanInfo,
    language: comicBooksTable.language,
    format: comicBooksTable.format,
    blackAndWhite: comicBooksTable.blackAndWhite,
    manga: comicBooksTable.manga,
    readingDirection: comicBooksTable.readingDirection,
    review: comicBooksTable.review,
    ageRating: comicBooksTable.ageRating,
    communityRating: comicBooksTable.communityRating,
    createdAt: comicBooksTable.createdAt,
    updatedAt: comicBooksTable.updatedAt,
  };

  // Build the query with only the required joins
  let dynamicQuery = db.selectDistinct(selectFields).from(comicBooksTable).$dynamic();

  // Add joins conditionally
  if (requiredJoins.has("writers")) {
    dynamicQuery = dynamicQuery
      .leftJoin(
        comicBookWritersTable,
        eq(comicBooksTable.id, comicBookWritersTable.comicBookId),
      )
      .leftJoin(
        comicWritersTable,
        eq(comicBookWritersTable.comicWriterId, comicWritersTable.id),
      );
  }

  if (requiredJoins.has("pencillers")) {
    dynamicQuery = dynamicQuery
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
      );
  }

  if (requiredJoins.has("inkers")) {
    dynamicQuery = dynamicQuery
      .leftJoin(
        comicBookInkersTable,
        eq(comicBooksTable.id, comicBookInkersTable.comicBookId),
      )
      .leftJoin(
        comicInkersTable,
        eq(comicBookInkersTable.comicInkerId, comicInkersTable.id),
      );
  }

  if (requiredJoins.has("colorists")) {
    dynamicQuery = dynamicQuery
      .leftJoin(
        comicBookColoristsTable,
        eq(comicBooksTable.id, comicBookColoristsTable.comicBookId),
      )
      .leftJoin(
        comicColoristsTable,
        eq(comicBookColoristsTable.comicColoristId, comicColoristsTable.id),
      );
  }

  if (requiredJoins.has("letterers")) {
    dynamicQuery = dynamicQuery
      .leftJoin(
        comicBookLetterersTable,
        eq(comicBooksTable.id, comicBookLetterersTable.comicBookId),
      )
      .leftJoin(
        comicLetterersTable,
        eq(comicBookLetterersTable.comicLetterId, comicLetterersTable.id),
      );
  }

  if (requiredJoins.has("editors")) {
    dynamicQuery = dynamicQuery
      .leftJoin(
        comicBookEditorsTable,
        eq(comicBooksTable.id, comicBookEditorsTable.comicBookId),
      )
      .leftJoin(
        comicEditorsTable,
        eq(comicBookEditorsTable.comicEditorId, comicEditorsTable.id),
      );
  }

  if (requiredJoins.has("cover_artists")) {
    dynamicQuery = dynamicQuery
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
      );
  }

  if (requiredJoins.has("publishers")) {
    dynamicQuery = dynamicQuery
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
      );
  }

  if (requiredJoins.has("imprints")) {
    dynamicQuery = dynamicQuery
      .leftJoin(
        comicBookImprintsTable,
        eq(comicBooksTable.id, comicBookImprintsTable.comicBookId),
      )
      .leftJoin(
        comicImprintsTable,
        eq(comicBookImprintsTable.comicImprintId, comicImprintsTable.id),
      );
  }

  if (requiredJoins.has("genres")) {
    dynamicQuery = dynamicQuery
      .leftJoin(
        comicBookGenresTable,
        eq(comicBooksTable.id, comicBookGenresTable.comicBookId),
      )
      .leftJoin(
        comicGenresTable,
        eq(comicBookGenresTable.comicGenreId, comicGenresTable.id),
      );
  }

  if (requiredJoins.has("characters")) {
    dynamicQuery = dynamicQuery
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
      );
  }

  if (requiredJoins.has("teams")) {
    dynamicQuery = dynamicQuery
      .leftJoin(
        comicBookTeamsTable,
        eq(comicBooksTable.id, comicBookTeamsTable.comicBookId),
      )
      .leftJoin(
        comicTeamsTable,
        eq(comicBookTeamsTable.comicTeamId, comicTeamsTable.id),
      );
  }

  if (requiredJoins.has("locations")) {
    dynamicQuery = dynamicQuery
      .leftJoin(
        comicBookLocationsTable,
        eq(comicBooksTable.id, comicBookLocationsTable.comicBookId),
      )
      .leftJoin(
        comicLocationsTable,
        eq(comicBookLocationsTable.comicLocationId, comicLocationsTable.id),
      );
  }

  if (requiredJoins.has("story_arcs")) {
    dynamicQuery = dynamicQuery
      .leftJoin(
        comicBookStoryArcsTable,
        eq(comicBooksTable.id, comicBookStoryArcsTable.comicBookId),
      )
      .leftJoin(
        comicStoryArcsTable,
        eq(comicBookStoryArcsTable.comicStoryArcId, comicStoryArcsTable.id),
      );
  }

  if (requiredJoins.has("series_groups")) {
    dynamicQuery = dynamicQuery
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
  let orderByColumn: SQLiteColumn;
  const sortOrder: "asc" | "desc" = serviceDetails.sort?.order || "desc";

  // Determine the column to sort by based on property type
  if (
    COMIC_BOOK_INTERNAL_METADATA_PROPERTIES.includes(
      sortProperty as typeof COMIC_BOOK_INTERNAL_METADATA_PROPERTIES[number],
    )
  ) {
    // Internal properties - sort directly on comic_books table
    switch (sortProperty) {
      case "id":
        orderByColumn = comicBooksTable.id;
        break;
      case "title":
        orderByColumn = comicBooksTable.title;
        break;
      case "issue_number":
        orderByColumn = comicBooksTable.issueNumber;
        break;
      case "volume":
        orderByColumn = comicBooksTable.volume;
        break;
      case "summary":
        orderByColumn = comicBooksTable.summary;
        break;
      case "series":
        orderByColumn = comicBooksTable.series;
        break;
      case "alternate_series":
        orderByColumn = comicBooksTable.alternateSeries;
        break;
      case "alternate_issue_number":
        orderByColumn = comicBooksTable.alternateIssueNumber;
        break;
      case "publication_date":
        orderByColumn = comicBooksTable.publicationDate;
        break;
      case "created_at":
        orderByColumn = comicBooksTable.createdAt;
        break;
      case "updated_at":
        orderByColumn = comicBooksTable.updatedAt;
        break;
      default:
        orderByColumn = comicBooksTable.createdAt;
    }
  } else if (
    COMIC_BOOK_EXTERNAL_METADATA_PROPERTIES.includes(
      sortProperty as typeof COMIC_BOOK_EXTERNAL_METADATA_PROPERTIES[number],
    )
  ) {
    // External properties - sort on joined table columns (only if we actually joined the table)
    switch (sortProperty) {
      case "characters":
        orderByColumn = requiredJoins.has("characters")
          ? comicCharactersTable.name
          : comicBooksTable.createdAt;
        break;
      case "colorists":
        orderByColumn = requiredJoins.has("colorists")
          ? comicColoristsTable.name
          : comicBooksTable.createdAt;
        break;
      case "cover_artists":
        orderByColumn = requiredJoins.has("cover_artists")
          ? comicCoverArtistsTable.name
          : comicBooksTable.createdAt;
        break;
      case "editors":
        orderByColumn = requiredJoins.has("editors")
          ? comicEditorsTable.name
          : comicBooksTable.createdAt;
        break;
      case "genres":
        orderByColumn = requiredJoins.has("genres")
          ? comicGenresTable.name
          : comicBooksTable.createdAt;
        break;
      case "imprints":
        orderByColumn = requiredJoins.has("imprints")
          ? comicImprintsTable.name
          : comicBooksTable.createdAt;
        break;
      case "inkers":
        orderByColumn = requiredJoins.has("inkers")
          ? comicInkersTable.name
          : comicBooksTable.createdAt;
        break;
      case "letterers":
        orderByColumn = requiredJoins.has("letterers")
          ? comicLetterersTable.name
          : comicBooksTable.createdAt;
        break;
      case "locations":
        orderByColumn = requiredJoins.has("locations")
          ? comicLocationsTable.name
          : comicBooksTable.createdAt;
        break;
      case "pencillers":
        orderByColumn = requiredJoins.has("pencillers")
          ? comicPencillersTable.name
          : comicBooksTable.createdAt;
        break;
      case "publishers":
        orderByColumn = requiredJoins.has("publishers")
          ? comicPublishersTable.name
          : comicBooksTable.createdAt;
        break;
      case "story_arcs":
        orderByColumn = requiredJoins.has("story_arcs")
          ? comicStoryArcsTable.name
          : comicBooksTable.createdAt;
        break;
      case "teams":
        orderByColumn = requiredJoins.has("teams")
          ? comicTeamsTable.name
          : comicBooksTable.createdAt;
        break;
      case "writers":
        orderByColumn = requiredJoins.has("writers")
          ? comicWritersTable.name
          : comicBooksTable.createdAt;
        break;
      default:
        orderByColumn = comicBooksTable.createdAt;
    }
  } else {
    // Fallback to default
    orderByColumn = comicBooksTable.createdAt;
  }

  // Apply pagination defaults
  const offset: number = serviceDetails.offset || 0;
  const limit: number = serviceDetails.limit || 20;

  try {
    // Execute the query with sorting and pagination
    // Use selectDistinct to ensure one row per comic book ID
    const result = await finalQuery
      .orderBy(sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn))
      .limit(limit)
      .offset(offset);

    // TODO: here is where we attatch the metadata + convert the comicBook to comicBookWithMetadata

    return result;
  } catch (error) {
    console.error(
      "Error fetching comic books with metadata filtering and sorting:",
      error,
    );
    throw error;
  }
};

/**
 * Gets all comic books sorted by creation date
 * @param offset number numberical offset for pagination
 * @param limit number numerical limit for pagination
 * @param sort string | undefined sort order, either 'asc' or 'desc'
 * @returns Promise resolving to an array of ComicBook objects
 */
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
    const result: ComicBook[] = await db.select().from(comicBooksTable).limit(limit).offset(
      offset,
    ).orderBy(
      sort === "asc"
        ? asc(comicBooksTable.createdAt)
        : desc(comicBooksTable.createdAt),
    );

    return result;
  } catch (error) {
    console.error("Error fetching all comic books sorted by date:", error);
    throw error;
  }
};

/**
 * Gets a random comic book from the database  
 * @returns Promise resolving to a ComicBook object or null if none found
 */
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

/**
 * Inserts a new comic book into the database
 * @param comicBook The comic book data to insert
 * @returns The ID of the newly inserted comic book
 */
export const insertComicBook = async (comicBook: NewComicBook): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const insertQuery: { id: number }[] = await db
      .insert(comicBooksTable)
      .values(comicBook)
      .returning({ id: comicBooksTable.id });

    return insertQuery[0].id;
  } catch (error) {
    console.error("Error inserting comic book:", error);
    throw error;
  }
};

/**
 * Gets the comic book by its ID
 * @param id Id of the comic book
 * @returns The comic book object or null if not found
 */
export const getComicBookById = async (
  id: number,
): Promise<ComicBook | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicBook[] = await db
      .select()
      .from(comicBooksTable)
      .where(
        eq(comicBooksTable.id, id),
      );

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching comic book by ID:", error);
    throw error;
  }
};

/**
 * Returns the comic book matching the given file path
 * @param filePath String representing the internal path of the comic book file
 * @returns The comic book object or null if not found
 */
export const getComicBookByFilePath = async (
  filePath: string,
): Promise<ComicBook | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicBook[] = await db
      .select()
      .from(comicBooksTable)
      .where(
        eq(comicBooksTable.filePath, filePath),
      );
    
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching comic book by file path:", error);
    throw error;
  }
};

/**
 * Retrieves comic books by their hash value; note multiple comic books can share the same hash if they are duplicates.
 * @param hash String representing the hash of the comic book
 * @returns An array of comic book objects matching the given hash
 */
export const getComicBooksByHash = async (
  hash: string,
): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicBook[] = await db
      .select()
      .from(comicBooksTable)
      .where(
        eq(comicBooksTable.hash, hash),
      );

    return result;
  } catch (error) {
    console.error("Error fetching comic books by hash:", error);
    throw error;
  }
};

/**
 * Updates an existing comic book with the given updates
 * @param id the ID of the comic book to update
 * @param updates The fields to update in the comic book
 * @returns A boolean indicating whether the update was successful
 */
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
    if (updates.libraryId !== undefined) {
      updateData.libraryId = updates.libraryId;
    }
    if (updates.filePath !== undefined) {
      updateData.filePath = updates.filePath;
    }
    if (updates.hash !== undefined) updateData.hash = updates.hash;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.series !== undefined) updateData.series = updates.series;
    if (updates.issueNumber !== undefined) {
      updateData.issueNumber = updates.issueNumber;
    }
    if (updates.count !== undefined) updateData.count = updates.count;
    if (updates.volume !== undefined) updateData.volume = updates.volume;
    if (updates.alternateSeries !== undefined) {
      updateData.alternateSeries = updates.alternateSeries;
    }
    if (updates.alternateIssueNumber !== undefined) {
      updateData.alternateIssueNumber = updates.alternateIssueNumber;
    }
    if (updates.alternateCount !== undefined) {
      updateData.alternateCount = updates.alternateCount;
    }
    if (updates.pageCount !== undefined) {
      updateData.pageCount = updates.pageCount;
    }
    if (updates.summary !== undefined) updateData.summary = updates.summary;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.year !== undefined) updateData.year = updates.year;
    if (updates.month !== undefined) updateData.month = updates.month;
    if (updates.day !== undefined) updateData.day = updates.day;
    if (updates.publisher !== undefined) {
      updateData.publisher = updates.publisher;
    }
    if (updates.publicationDate !== undefined) {
      updateData.publicationDate = updates.publicationDate;
    }
    if (updates.scanInfo !== undefined) {
      updateData.scanInfo = updates.scanInfo;
    }
    if (updates.language !== undefined) updateData.language = updates.language; // Note: keeping schema typo
    if (updates.format !== undefined) updateData.format = updates.format;
    if (updates.blackAndWhite !== undefined) {
      updateData.blackAndWhite = updates.blackAndWhite;
    }
    if (updates.manga !== undefined) updateData.manga = updates.manga;
    if (updates.readingDirection !== undefined) {
      updateData.readingDirection = updates.readingDirection;
    }
    if (updates.review !== undefined) updateData.review = updates.review;
    if (updates.ageRating !== undefined) {
      updateData.ageRating = updates.ageRating;
    }
    if (updates.communityRating !== undefined) {
      updateData.communityRating = updates.communityRating;
    }
    if (updates.fileSize !== undefined) {
      updateData.fileSize = updates.fileSize;
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


/**
 * Gets comic books by their library ID
 * @param libraryId The ID of the library
 * @returns An array of comic book objects belonging to the specified library
 * 
 * TODO: paginate this with new filtering/sorting system
 */
export const getComicBooksByLibrary = async (
  libraryId: number,
): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicBook[] = await db
      .select()
      .from(comicBooksTable)
      .where(
        eq(comicBooksTable.libraryId, libraryId),
      );

    return result;
  } catch (error) {
    console.error("Error fetching comic books by library:", error);
    throw error;
  }
};

/**
 * Returns comic books associated with a specific series ID
 * @param seriesId The ID of the comic series
 * @returns An array of comic book objects belonging to the specified series
 */
export const getComicBooksBySeriesId = async (
  seriesId: number,
): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicBook[] = await db
      .select(
        {
          id: comicBooksTable.id,
          libraryId: comicBooksTable.libraryId,
          filePath: comicBooksTable.filePath,
          hash: comicBooksTable.hash,
          title: comicBooksTable.title,
          series: comicBooksTable.series,
          issueNumber: comicBooksTable.issueNumber,
          count: comicBooksTable.count,
          volume: comicBooksTable.volume,
          alternateSeries: comicBooksTable.alternateSeries,
          alternateIssueNumber: comicBooksTable.alternateIssueNumber,
          alternateCount: comicBooksTable.alternateCount,
          pageCount: comicBooksTable.pageCount,
          fileSize: comicBooksTable.fileSize,
          summary: comicBooksTable.summary,
          notes: comicBooksTable.notes,
          year: comicBooksTable.year,
          month: comicBooksTable.month,
          day: comicBooksTable.day,
          publisher: comicBooksTable.publisher,
          publicationDate: comicBooksTable.publicationDate,
          scanInfo: comicBooksTable.scanInfo,
          language: comicBooksTable.language,
          format: comicBooksTable.format,
          blackAndWhite: comicBooksTable.blackAndWhite,
          manga: comicBooksTable.manga,
          readingDirection: comicBooksTable.readingDirection,
          review: comicBooksTable.review,
          ageRating: comicBooksTable.ageRating,
          communityRating: comicBooksTable.communityRating,
          createdAt: comicBooksTable.createdAt,
          updatedAt: comicBooksTable.updatedAt,
        },
      )
      .from(comicBooksTable)
      .innerJoin(
        comicSeriesBooksTable,
        eq(comicBooksTable.id, comicSeriesBooksTable.comicBookId),
      )
      .where(eq(comicSeriesBooksTable.comicSeriesId, seriesId))
      .orderBy(asc(comicBooksTable.issueNumber));

    return result;
  } catch (error) {
    console.error("Error fetching comic books by series:", error);
    throw error;
  }
};

/**
 * Gets comic books by their publisher name
 * @param publisher The String publisher name 
 * @returns An array of comic book objects published by the specified publisher
 * 
 * TODO: Add optional id parameter to get by publisher id instead of name as name may not be unique
 */
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

/**
 * Gets comic books by their publication year
 * @param year The numerical year of publication
 * @returns An array of comic book objects published in the specified year
 */
export const getComicBooksByYear = async (
  year: number,
): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicBook[] = await db
      .select()
      .from(comicBooksTable)
      .where(
        eq(comicBooksTable.year, year),
      );

    return result;
  } catch (error) {
    console.error("Error fetching comic books by year:", error);
    throw error;
  }
};

/**
 * Searches comic books by matching a query string against multiple fields
 * @param query The search query string to match against title, series, publisher, and summary
 * @returns An array of comic book objects matching the search criteria
 */
export const searchComicBooks = async (query: string): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const likeQuery: string = `%${query}%`;
    const result: ComicBook[] = await db
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

/**
 * Deletes a comic book from the database by its ID
 * @param id The ID of the comic book to delete
 * @returns A boolean indicating whether the deletion was successful
 */
export const deleteComicBook = async (id: number): Promise<boolean> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .delete(comicBooksTable)
      .where(eq(comicBooksTable.id, id))
      .returning({ id: comicBooksTable.id });

    return result.length > 0;
  } catch (error) {
    console.error("Error deleting comic book:", error);
    throw error;
  }
};

/**
 * Retrieves duplicate comic books grouped by hash with pagination support
 * @param offset The number of records to skip for pagination
 * @param limit The maximum number of records to retrieve
 * @returns An array of comic book objects that have duplicates (multiple books with same hash)
 */
export const getComicDuplicates = async (
  offset: number,
  limit: number,
): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicBook[] = await db
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
  params: ComicBookQueryParams = {},
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
    sortBy = "created_at",
    sortOrder = "desc",
  } = params;

  try {
    // Now we build up any where conditions we may have based on the filters provided
    const whereConditions: Array<ReturnType<typeof eq> | ReturnType<typeof inArray> | ReturnType<typeof ilike> | ReturnType<typeof or>> = [];

    if (titleFilter) {
      whereConditions.push(
        ilike(comicBooksTable.title, `%${titleFilter}%`),
      );
    }

    if (seriesFilter) {
      whereConditions.push(
        ilike(comicBooksTable.series, `%${seriesFilter}%`),
      );
    }

    if (writerFilter) {
      whereConditions.push(
        ilike(comicWritersTable.name, `%${writerFilter}%`),
      );
    }

    if (artistFilter) {
      whereConditions.push(
        or(
          ilike(comicPencillersTable.name, `%${artistFilter}%`),
          ilike(comicInkersTable.name, `%${artistFilter}%`),
          ilike(comicColoristsTable.name, `%${artistFilter}%`),
          ilike(comicCoverArtistsTable.name, `%${artistFilter}%`),
        ),
      );
    }

    if (publisherFilter) {
      whereConditions.push(
        or(
          ilike(comicBooksTable.publisher, `%${publisherFilter}%`),
          ilike(comicPublishersTable.name, `%${publisherFilter}%`),
        ),
      );
    }

    if (genreFilter) {
      whereConditions.push(
        ilike(comicGenresTable.name, `%${genreFilter}%`),
      );
    }

    if (characterFilter) {
      whereConditions.push(
        ilike(comicCharactersTable.name, `%${characterFilter}%`),
      );
    }

    if (yearFilter) {
      whereConditions.push(
        eq(comicBooksTable.year, yearFilter),
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
          ilike(comicCharactersTable.name, `%${generalFilter}%`),
        ),
      );
    }

    // Then we determine sorting similar to before instead we define the value of orderByColumn dynamically
    let orderByColumn: SQLiteColumn;
    switch (sortBy) {
      case "title":
        orderByColumn = comicBooksTable.title;
        break;
      case "series":
        orderByColumn = comicBooksTable.series;
        break;
      case "issue_number":
        orderByColumn = comicBooksTable.issueNumber;
        break;
      case "publication_year":
        orderByColumn = comicBooksTable.year;
        break;
      case "file_name":
        orderByColumn = comicBooksTable.filePath;
        break;
      case "writer":
        orderByColumn = comicWritersTable.name;
        break;
      case "publisher":
        orderByColumn = comicPublishersTable.name;
        break;
      case "genre":
        orderByColumn = comicGenresTable.name;
        break;
      case "created_at":
        orderByColumn = comicBooksTable.createdAt;
        break;
      case "updated_at":
        orderByColumn = comicBooksTable.updatedAt;
        break;
      default:
        orderByColumn = comicBooksTable.createdAt;
    }

    // Now we build up the query, joining the comic book table with all relevant metadata tables
    const baseQuery = db
      .selectDistinct({
        id: comicBooksTable.id,
        libraryId: comicBooksTable.libraryId,
        filePath: comicBooksTable.filePath,
        hash: comicBooksTable.hash,
        title: comicBooksTable.title,
        series: comicBooksTable.series,
        issueNumber: comicBooksTable.issueNumber,
        count: comicBooksTable.count,
        volume: comicBooksTable.volume,
        alternateSeries: comicBooksTable.alternateSeries,
        alternateIssueNumber: comicBooksTable.alternateIssueNumber,
        alternateCount: comicBooksTable.alternateCount,
        pageCount: comicBooksTable.pageCount,
        fileSize: comicBooksTable.fileSize,
        summary: comicBooksTable.summary,
        notes: comicBooksTable.notes,
        year: comicBooksTable.year,
        month: comicBooksTable.month,
        day: comicBooksTable.day,
        publisher: comicBooksTable.publisher,
        publicationDate: comicBooksTable.publicationDate,
        scanInfo: comicBooksTable.scanInfo,
        language: comicBooksTable.language,
        format: comicBooksTable.format,
        blackAndWhite: comicBooksTable.blackAndWhite,
        manga: comicBooksTable.manga,
        readingDirection: comicBooksTable.readingDirection,
        review: comicBooksTable.review,
        ageRating: comicBooksTable.ageRating,
        communityRating: comicBooksTable.communityRating,
        createdAt: comicBooksTable.createdAt,
        updatedAt: comicBooksTable.updatedAt,
      })
      .from(comicBooksTable)
      // Writers
      .leftJoin(
        comicBookWritersTable,
        eq(comicBooksTable.id, comicBookWritersTable.comicBookId),
      )
      .leftJoin(
        comicWritersTable,
        eq(comicBookWritersTable.comicWriterId, comicWritersTable.id),
      )
      // Pencillers
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
      // Inkers
      .leftJoin(
        comicBookInkersTable,
        eq(comicBooksTable.id, comicBookInkersTable.comicBookId),
      )
      .leftJoin(
        comicInkersTable,
        eq(comicBookInkersTable.comicInkerId, comicInkersTable.id),
      )
      // Colorists
      .leftJoin(
        comicBookColoristsTable,
        eq(comicBooksTable.id, comicBookColoristsTable.comicBookId),
      )
      .leftJoin(
        comicColoristsTable,
        eq(comicBookColoristsTable.comicColoristId, comicColoristsTable.id),
      )
      // Letterers
      .leftJoin(
        comicBookLetterersTable,
        eq(comicBooksTable.id, comicBookLetterersTable.comicBookId),
      )
      .leftJoin(
        comicLetterersTable,
        eq(comicBookLetterersTable.comicLetterId, comicLetterersTable.id),
      )
      // Editors
      .leftJoin(
        comicBookEditorsTable,
        eq(comicBooksTable.id, comicBookEditorsTable.comicBookId),
      )
      .leftJoin(
        comicEditorsTable,
        eq(comicBookEditorsTable.comicEditorId, comicEditorsTable.id),
      )
      // Cover Artists
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
      // Publishers
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
      // Imprints
      .leftJoin(
        comicBookImprintsTable,
        eq(comicBooksTable.id, comicBookImprintsTable.comicBookId),
      )
      .leftJoin(
        comicImprintsTable,
        eq(comicBookImprintsTable.comicImprintId, comicImprintsTable.id),
      )
      // Genres
      .leftJoin(
        comicBookGenresTable,
        eq(comicBooksTable.id, comicBookGenresTable.comicBookId),
      )
      .leftJoin(
        comicGenresTable,
        eq(comicBookGenresTable.comicGenreId, comicGenresTable.id),
      )
      // Characters
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
      // Teams
      .leftJoin(
        comicBookTeamsTable,
        eq(comicBooksTable.id, comicBookTeamsTable.comicBookId),
      )
      .leftJoin(
        comicTeamsTable,
        eq(comicBookTeamsTable.comicTeamId, comicTeamsTable.id),
      )
      // Locations
      .leftJoin(
        comicBookLocationsTable,
        eq(comicBooksTable.id, comicBookLocationsTable.comicBookId),
      )
      .leftJoin(
        comicLocationsTable,
        eq(comicBookLocationsTable.comicLocationId, comicLocationsTable.id),
      )
      // Story Arcs
      .leftJoin(
        comicBookStoryArcsTable,
        eq(comicBooksTable.id, comicBookStoryArcsTable.comicBookId),
      )
      .leftJoin(
        comicStoryArcsTable,
        eq(comicBookStoryArcsTable.comicStoryArcId, comicStoryArcsTable.id),
      )
      // Series Groups
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
      .$dynamic();

    // Apply WHERE conditions if any
    const finalQuery: typeof baseQuery = whereConditions.length > 0
      ? baseQuery.where(and(...whereConditions))
      : baseQuery;

    // Apply ordering and pagination
    const result: ComicBook[] = await finalQuery
      .orderBy(sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn))
      .limit(limit)
      .offset(offset);

    return result;
  } catch (error) {
    console.error("Error fetching comic books with metadata:", error);
    throw error;
  }
};
