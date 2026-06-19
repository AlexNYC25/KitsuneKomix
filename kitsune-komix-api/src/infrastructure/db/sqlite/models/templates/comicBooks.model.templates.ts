
import type { ComicBookFilteringAndSortingParams, ComicBookFilterItem, AllowedFilterProperties } from "#types/index.ts";

// Ready to use templates for comic book queries that return a ComicBookFilteringAndSortingParams object.
// To be used with getComicBooksWithMetadataFilteringSorting() function in comicBooks.model.ts when we need to query comic books with specific filters/sorting but want to avoid repeating the same code for creating the filtering/sorting params object every time.

/**
 * Template for getting a comic book by ID. This can be used as a base for more complex queries that need to filter by ID.
 * @param id The ID of the comic book to retrieve
 * @returns A valid ComicBookFilteringAndSortingParams object that can be used to query the database for a comic book with the specified ID
 */
export const getByIdTemplate = (id: number): ComicBookFilteringAndSortingParams => {
  const getByIdFilter: ComicBookFilterItem = {
    filterProperty: "id" as AllowedFilterProperties,
    filterValue: id.toString(),
  }

  return {
    filters: [getByIdFilter],
    sort: undefined,
    offset: 0,
    limit: 1
  }
}