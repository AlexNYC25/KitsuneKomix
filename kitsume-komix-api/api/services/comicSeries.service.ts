
import { getUsersComicLibraries } from "../../db/sqlite/models/comicLibraries.model.ts";
import { getLatestComicSeries, getUpdatedComicSeries } from "../../db/sqlite/models/comicSeries.model.ts";
import { getComicBooksBySeriesId } from "../../db/sqlite/models/comicBooks.model.ts";
import { getThumbnailsByComicBookId } from "../../db/sqlite/models/comicBookThumbnails.model.ts";
import type { ComicSeries } from "../../types/index.ts";

type ComicSeriesWithThumbnail = ComicSeries & { thumbnailUrl?: string };

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
