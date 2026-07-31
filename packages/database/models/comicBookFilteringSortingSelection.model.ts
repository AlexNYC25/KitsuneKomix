import { eq, sql, ilike, asc, desc } from "drizzle-orm";
import type { SQLiteSelect } from "drizzle-orm/sqlite-core";

import { getClient } from "../drizzle/client.ts";
import { dbLogger } from "../loggers/index.ts";
import { env } from "../config/env.ts"

import {
  comicBookGenresTable,
  comicBookPublishersTable,
  comicBooksTable,
  comicBookStoryArcsTable,
  comicLibrariesSeriesTable,
  comicLibrariesTable,
  comicSeriesBooksTable,
  comicSeriesTable,
  comicWebLinksTable,
} from "../schemas/index.ts";

import type {
  ComicBook,
  ComicBookFilteringAndSortingParams,
  ComicBookFilterItem,
  ComicSortField,
} from "../shared/types/index.ts"

/**
 * Exclusive dynamic filtering function specifically for getComicBooksWithMetadataFilteringSorting
 * This is necessary as the filtering can be applied to any of the fields in the comic book table and we need to dynamically apply it to the query builder.
 * @param filter
 * @param query
 * @returns the query with the filter applied
 * 
 * TODO: Verify
 */
const addFilteringToQuery = <T extends SQLiteSelect>(
  filter: ComicBookFilterItem | undefined,
  query: T,
): T => {
  if (!filter) {
    return query;
  }

  const { filterProperty, filterValue } = filter;

  switch (filterProperty) {
    case "id":
      query.where(eq(comicBooksTable.id, Number(filterValue)));
      break;
    case "seriesId":
      query.where(eq(comicSeriesTable.id, Number(filterValue)));
      break;
    case "hash":
      query.where(eq(comicBooksTable.hash, filterValue));
      break;
    case "duplicateHash":
      if (filterValue === "true") {
        query.where(sql`${comicBooksTable.hash} IN (
          SELECT ${comicBooksTable.hash}
          FROM ${comicBooksTable}
          GROUP BY ${comicBooksTable.hash}
          HAVING COUNT(*) > 1
        )`);
      }
      if (filterValue === "false") {
        query.where(sql`${comicBooksTable.hash} IN (
          SELECT ${comicBooksTable.hash}
          FROM ${comicBooksTable}
          GROUP BY ${comicBooksTable.hash}
          HAVING COUNT(*) = 1
        )`);
      }
      break;
    case "title":
      query.where(ilike(comicBooksTable.title, `%${filterValue}%`));
      break;
    case "series":
      query.where(ilike(comicBooksTable.series, `%${filterValue}%`));
      break;
    case "issueNumber":
      query.where(eq(comicBooksTable.issueNumber, filterValue));
      break;
    case "volumeNumber":
      query.where(eq(comicBooksTable.volumeNumber, filterValue));
      break;
    case "alternateSeries":
      query.where(ilike(comicBooksTable.alternateSeries, `%${filterValue}%`));
      break;
    case "alternateIssueNumber":
      query.where(eq(comicBooksTable.alternateIssueNumber, filterValue));
      break;
    case "fileSize":
      query.where(eq(comicBooksTable.fileSize, Number(filterValue)));
      break;
    case "year":
      query.where(eq(comicBooksTable.year, Number(filterValue)));
      break;
    case "month":
      query.where(eq(comicBooksTable.month, Number(filterValue)));
      break;
    case "day":
      query.where(eq(comicBooksTable.day, Number(filterValue)));
      break;
    case "date":
      query.where(eq(comicBooksTable.publicationDate, filterValue));
      break;
    case "publisher":
      query.where(ilike(comicBooksTable.publisher, `%${filterValue}%`));
      break;
    case "publicationDate":
      query.where(eq(comicBooksTable.publicationDate, filterValue));
      break;
    case "scanInfo":
      query.where(ilike(comicBooksTable.scanInfo, `%${filterValue}%`));
      break;
    case "language":
      query.where(ilike(comicBooksTable.language, `%${filterValue}%`));
      break;
    case "format":
      query.where(ilike(comicBooksTable.format, `%${filterValue}%`));
      break;
    case "blackAndWhite":
      query.where(
        eq(comicBooksTable.blackAndWhite, filterValue === "true" ? true: false),
      );
      break;
    case "manga":
      query.where(eq(comicBooksTable.manga, filterValue === "true" ? true : false));
      break;
    case "readingDirection":
      query.where(ilike(comicBooksTable.readingDirection, `%${filterValue}%`));
      break;
    case "review":
      query.where(ilike(comicBooksTable.review, `%${filterValue}%`));
      break;
    case "ageRating":
      query.where(ilike(comicBooksTable.ageRating, `%${filterValue}%`));
      break;
    case "communityRating":
      query.where(eq(comicBooksTable.communityRating, Number(filterValue)));
      break;
    case "createdAt":
      query.where(eq(comicBooksTable.createdAt, filterValue));
      break;
    case "updatedAt":
      query.where(eq(comicBooksTable.updatedAt, filterValue));
      break;
    case "listLetter":
      query.where(ilike(comicBooksTable.title, `${filterValue}%`));
      break;
    case "libraryId":
      query.where(eq(comicLibrariesTable.id, Number(filterValue)));
      break;
  }

  return query;
};

/**
 * Exclusive dynamic sorting function specifcally for getComicBooksWithMetadataFilteringSorting
 * This is necessary as the sorting can be applied to any of the fields in the comic book table and we need to dynamically apply it to the query builder.
 * @param sortProperty
 * @param sortDirection
 * @param query
 * @returns the query with the sorting applied
 * 
 * TODO: Verify
 */
const addSortingToQuery = <T extends SQLiteSelect>(
  sortProperty: ComicSortField,
  sortDirection: string,
  query: T,
): T => {
  const direction = sortDirection === "asc" ? asc : desc;

  switch (sortProperty) {
    case "title":
      query.orderBy(direction(comicBooksTable.title));
      break;
    case "issueNumber":
      query.orderBy(direction(comicBooksTable.issueNumber));
      break;
    case "volumeNumber":
      query.orderBy(direction(comicBooksTable.volumeNumber));
      break;
    case "alternateSeries":
      query.orderBy(direction(comicBooksTable.alternateSeries));
      break;
    case "alternateIssueNumber":
      query.orderBy(direction(comicBooksTable.alternateIssueNumber));
      break;
    case "fileSize":
      query.orderBy(direction(comicBooksTable.fileSize));
      break;
    case "year":
      query.orderBy(direction(comicBooksTable.year));
      break;
    case "month":
      query.orderBy(direction(comicBooksTable.month));
      break;
    case "day":
      query.orderBy(direction(comicBooksTable.day));
      break;
    case "date":
    case "publicationDate":
      query.orderBy(direction(comicBooksTable.publicationDate));
      break;
    case "publisher":
      query.orderBy(direction(comicBooksTable.publisher));
      break;
    case "language":
      query.orderBy(direction(comicBooksTable.language));
      break;
    case "format":
      query.orderBy(direction(comicBooksTable.format));
      break;
    case "blackAndWhite":
      query.orderBy(direction(comicBooksTable.blackAndWhite));
      break;
    case "manga":
      query.orderBy(direction(comicBooksTable.manga));
      break;
    case "readingDirection":
      query.orderBy(direction(comicBooksTable.readingDirection));
      break;
    case "ageRating":
      query.orderBy(direction(comicBooksTable.ageRating));
      break;
    case "communityRating":
      query.orderBy(direction(comicBooksTable.communityRating));
      break;
    case "createdAt":
      query.orderBy(direction(comicBooksTable.createdAt));
      break;
    case "updatedAt":
      query.orderBy(direction(comicBooksTable.updatedAt));
      break;
    case "storyArcPosition":
      query.orderBy(direction(comicBookStoryArcsTable.position));
      break;
  }

  return query;
};

/**
 * Gets comic books with metadata filtering and sorting
 * @param serviceDetails - Filtering and sorting parameters
 * @returns Promise resolving to an array of ComicBook objects
 *
 * Note: This function can be used to filter and sort on the metadata fields as well but not return them. i.e. we can filter by writer but not return the writer data with the comic book.
 * This metadata must be fetched separately after getting the comic books and attached to the comic book objects upstream.
 * 
 * TODO: Verify
 */
export const getComicBooksWithMetadataFilteringSorting = async (
  serviceDetails: ComicBookFilteringAndSortingParams,
): Promise<ComicBook[]> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database client is not initialized");
  }

  const offset = serviceDetails.offset || 0;
  const limit = serviceDetails.limit || env.PAGE_SIZE;

  try {
    let query = db.select(
      {
        id: comicBooksTable.id,
        libraryId: comicBooksTable.libraryId,
        filePath: comicBooksTable.filePath,
        hash: comicBooksTable.hash,
        title: comicBooksTable.title,
        series: comicBooksTable.series,
        issueNumber: comicBooksTable.issueNumber,
        count: comicBooksTable.count,
        volumeNumber: comicBooksTable.volumeNumber,
        alternateSeries: comicBooksTable.alternateSeries,
        alternateIssueNumber: comicBooksTable.alternateIssueNumber,
        alternateCount: comicBooksTable.alternateCount,
        alternateVolumeNumber: comicBooksTable.alternateVolumeNumber,
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
        createdAt: comicBooksTable.createdAt,
        updatedAt: comicBooksTable.updatedAt,
        language: comicBooksTable.language,
        format: comicBooksTable.format,
        blackAndWhite: comicBooksTable.blackAndWhite,
        manga: comicBooksTable.manga,
        readingDirection: comicBooksTable.readingDirection,
        review: comicBooksTable.review,
        ageRating: comicBooksTable.ageRating,
        communityRating: comicBooksTable.communityRating,
      },
    ).from(comicBooksTable)
      .leftJoin(
        comicSeriesBooksTable,
        eq(comicBooksTable.id, comicSeriesBooksTable.comicBookId),
      )
      .leftJoin(
        comicSeriesTable,
        eq(comicSeriesBooksTable.comicSeriesId, comicSeriesTable.id),
      )
      .leftJoin(
        comicBookPublishersTable,
        eq(comicBooksTable.id, comicBookPublishersTable.comicBookId),
      )
      .leftJoin(
        comicBookGenresTable,
        eq(comicBooksTable.id, comicBookGenresTable.comicBookId),
      )
      .leftJoin(
        comicBookStoryArcsTable,
        eq(comicBooksTable.id, comicBookStoryArcsTable.comicBookId),
      )
      .leftJoin(
        comicWebLinksTable,
        eq(comicBooksTable.id, comicWebLinksTable.comicBookId),
      )
      .leftJoin(
        comicLibrariesSeriesTable,
        eq(comicSeriesTable.id, comicLibrariesSeriesTable.comicSeriesId),
      )
      .leftJoin(
        comicLibrariesTable,
        eq(comicLibrariesTable.id, comicLibrariesSeriesTable.libraryId),
      )
      .groupBy(comicBooksTable.id)
      .offset(offset)
      .limit(limit)
      .$dynamic();

    if (serviceDetails.sort?.property && serviceDetails.sort.order) {
      query = addSortingToQuery(
        serviceDetails.sort.property,
        serviceDetails.sort.order,
        query,
      );
    }

    if (serviceDetails.filters && serviceDetails.filters.length > 0) {
      const firstValidFilter = serviceDetails.filters.find(
        (filter): filter is ComicBookFilterItem => filter !== undefined,
      );

      query = addFilteringToQuery(firstValidFilter, query);
    }

    return await query;
  } catch (error) {
    dbLogger.error("Error fetching comic books with metadata filtering and sorting:" + error);
    throw error;
  }
};