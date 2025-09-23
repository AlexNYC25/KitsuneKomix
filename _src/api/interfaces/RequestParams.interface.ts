
/**
 * Filter and Sort parameters for comprehensive comic book query
 */
export interface ComicBookQueryParams {
  // Pagination
  offset?: number;
  limit?: number;
  
  // Filtering
  titleFilter?: string;
  seriesFilter?: string;
  writerFilter?: string;
  artistFilter?: string; // Will search across pencillers, inkers, colorists, etc.
  publisherFilter?: string;
  genreFilter?: string;
  characterFilter?: string;
  yearFilter?: number;
  generalFilter?: string; // Search across multiple fields
  
  // Sorting
  sortBy?: 'title' | 'series' | 'issue_number' | 'publication_year' | 'created_at' | 'updated_at' | 'file_name' | 'writer' | 'publisher' | 'genre';
  sortOrder?: 'asc' | 'desc';
}