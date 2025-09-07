
import { ComicSeries, NewComicSeries, ComicSeriesWithBooks } from "./database.types.ts";

// Re-export database types
export type { ComicSeries, NewComicSeries, ComicSeriesWithBooks };

// Legacy types for backward compatibility
export type ComicSeriesRow = ComicSeries;

export type ComicSeriesDomain = {
  id: number;
  name: string;
  description?: string;
  folderPath: string;
  createdAt: string;
  updatedAt: string;
};

export type ComicSeriesInput = {
  name: string;
  description?: string;
  folderPath?: string;
};

export type ComicSeriesUpdate = Partial<ComicSeriesInput>;

export type ComicSeriesSearchParams = {
  name?: string;
  folderPath?: string;
};