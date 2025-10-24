
import { getUsersComicLibraries } from "../../db/sqlite/models/comicLibraries.model.ts";
import { getLatestComicSeries, getUpdatedComicSeries, getComicSeriesById, getComicSeriesMetadataById } from "../../db/sqlite/models/comicSeries.model.ts";
import { getComicBooksBySeriesId } from "../../db/sqlite/models/comicBooks.model.ts";
import { getThumbnailsByComicBookId } from "../../db/sqlite/models/comicBookThumbnails.model.ts";
import type { ComicSeries, ComicBook, ComicSeriesWithMetadata } from "../../types/index.ts";

// Extended type including optional thumbnail URL
type ComicSeriesWithThumbnail = ComicSeries & { thumbnailUrl?: string };

type ComicBookWithThumbnail = ComicBook & { thumbnailUrl?: string };

// Extended type including thumbnail URL and metadata object who may be empty or be a full metadata record
type ComicSeriesWithMetadataAndThumbnail = ComicSeriesWithThumbnail & {
  metadata: ComicSeriesWithMetadata | Record<PropertyKey, never>;
};

type ComicSeriesWithComicsMetadataAndThumbnail = ComicSeriesWithMetadataAndThumbnail & {
  comics: {
    total: number;
    books: Array<ComicBookWithThumbnail>;
  };
};

const CACHE_DIRECTORY = "/app/cache"; // Ensure this matches your actual cache directory TODO: move to config

export const getLatestComicSeriesUserCanAccess = async (
  userId: number,
  limit: number = 20,
  offset: number = 0,
): Promise<Array<ComicSeriesWithThumbnail>> => {
  const userLibraries = await getUsersComicLibraries(userId);

  const libraryIds = userLibraries.map(lib => lib.id);
  const latestSeries = await getLatestComicSeries(limit, offset, libraryIds);

	const latestSeriesWithThumbnails: Array<ComicSeriesWithThumbnail> = [];
  
  for (const series of latestSeries) {
    const comicBooksForCurrentSeries = await getComicBooksBySeriesId(series.id);
    if (comicBooksForCurrentSeries.length === 0) {
      // No comic books in this series, skip to next series
      continue;
    }

    const firstComicBook = comicBooksForCurrentSeries[0];

    const thumbnails = await getThumbnailsByComicBookId(firstComicBook.id);
    if (thumbnails && thumbnails.length > 0) {
			const seriesWithThumbnailUrl = series as ComicSeriesWithThumbnail;
      seriesWithThumbnailUrl.thumbnailUrl = thumbnails[0].file_path.replace(CACHE_DIRECTORY, "/api/image");
      latestSeriesWithThumbnails.push(seriesWithThumbnailUrl);
    } else {
			latestSeriesWithThumbnails.push(series as ComicSeriesWithThumbnail);
		}
	}

  return latestSeriesWithThumbnails;
}

export const getUpdatedComicSeriesUserCanAccess = async (
  userId: number,
  limit: number = 20,
  offset: number = 0,
): Promise<Array<ComicSeriesWithThumbnail>> => {
  const userLibraries = await getUsersComicLibraries(userId);

  const libraryIds = userLibraries.map(lib => lib.id);
  const updatedSeries = await getUpdatedComicSeries(limit, offset, libraryIds);

  const updatedSeriesWithThumbnails: Array<ComicSeriesWithThumbnail> = [];

  for (const series of updatedSeries) {
    const comicBooksForCurrentSeries = await getComicBooksBySeriesId(series.id);
    if (comicBooksForCurrentSeries.length === 0) {
      // No comic books in this series, skip to next series
      continue;
    }

    const firstComicBook = comicBooksForCurrentSeries[0];

    const thumbnails = await getThumbnailsByComicBookId(firstComicBook.id);
    if (thumbnails && thumbnails.length > 0) {
      const seriesWithThumbnailUrl = series as ComicSeriesWithThumbnail;
      seriesWithThumbnailUrl.thumbnailUrl = thumbnails[0].file_path.replace(CACHE_DIRECTORY, "/api/image");
      updatedSeriesWithThumbnails.push(seriesWithThumbnailUrl);
    } else {
      updatedSeriesWithThumbnails.push(series as ComicSeriesWithThumbnail);
    }
  }

  return updatedSeriesWithThumbnails;
}

export const getSelectedComicSeriesDetails = async (
  seriesId: number,
): Promise<ComicSeriesWithComicsMetadataAndThumbnail | null> => {
  const series = await getComicSeriesById(seriesId);
  if (!series) {
    return null;
  }

  const comicBooksForCurrentSeries: Array<ComicBook> = await getComicBooksBySeriesId(series.id);
  const comicBooksForCurrentSeriesWithThumbnails: Array<ComicBookWithThumbnail> = [];
  if (comicBooksForCurrentSeries.length === 0) {
    return null;
  }

  const firstComicBook = comicBooksForCurrentSeries[0];
  const thumbnails = await getThumbnailsByComicBookId(firstComicBook.id);

  for (const book of comicBooksForCurrentSeries) {
    const bookThumbnails = await getThumbnailsByComicBookId(book.id);
    if (bookThumbnails && bookThumbnails.length > 0) {
      (book as ComicBookWithThumbnail).thumbnailUrl = bookThumbnails[0].file_path.replace(CACHE_DIRECTORY, "/api/image");
    }
    comicBooksForCurrentSeriesWithThumbnails.push(book as ComicBookWithThumbnail);
  }

  const seriesWithThumbnailUrl = series as ComicSeriesWithThumbnail;
  if (thumbnails && thumbnails.length > 0) {
    seriesWithThumbnailUrl.thumbnailUrl = thumbnails[0].file_path.replace(CACHE_DIRECTORY, "/api/image");
  }

  const metadata: ComicSeriesWithMetadata | null = await getComicSeriesMetadataById(seriesId);

  const seriesWithComicsMetadataAndThumbnail = {
    ...seriesWithThumbnailUrl,
    metadata: metadata ? { ...metadata } : {},
    comics: { total: comicBooksForCurrentSeries.length, books: comicBooksForCurrentSeriesWithThumbnails },
  };

  return seriesWithComicsMetadataAndThumbnail;
}
