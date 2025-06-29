/*
  Reflects the structure of the comic_books table in the database.
  Essentially the same as querying * from comic_books
*/
export interface ComicBook {
  id: number;
  title: string;
  file_name: string;
  file_hash: string;
  file_path: string;
  timestamp: Date | null;
  metadata_id: number;
  series_id: number;
}