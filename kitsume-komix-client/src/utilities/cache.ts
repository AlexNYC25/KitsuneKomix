
/**
 * Creates a cache key for comic book listings based on the page, page size, and sort order.
 * 
 * @param page The page number for the list being cached
 * @param pageSize The number of items per page for the list being cached
 * @param sort The sort order for the list being cached (e.g., "latest", "updated", "name", "publicationDate")
 * @returns A string that can be used as a cache key for storing/retrieving comic book listings in the cache
 */
export const createCacheKeyForComics = (page: number, pageSize: number, sort: string): string => {
  return `${page}:${pageSize}:${sort}`;
}