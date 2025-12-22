import { getUsersComicLibraries } from "#sqlite/models/comicLibraries.model.ts";
import {
  getComicSeriesById,
  getComicSeriesMetadataById,
  getLatestComicSeries,
  getUpdatedComicSeries,
} from "#sqlite/models/comicSeries.model.ts";
import { getComicBooksBySeriesId } from "#sqlite/models/comicBooks.model.ts";
import { getThumbnailsByComicBookId } from "#sqlite/models/comicBookThumbnails.model.ts";

import { attachThumbnailToComicBook } from "./comicbooks.service.ts";

import type {
  ComicBook,
  ComicBookWithThumbnail,
  ComicSeries,
  ComicSeriesWithMetadata,
  ComicSeriesWithThumbnail,
  ComicSeriesWithMetadataAndThumbnail,
  ComicSeriesWithComicsMetadataAndThumbnail,
} from "#types/index.ts";

export const getLatestComicSeriesUserCanAccess = async (
  userId: number,
  limit: number = 20,
  offset: number = 0,
): Promise<Array<ComicSeriesWithThumbnail>> => {
  const userLibraries = await getUsersComicLibraries(userId);

  const libraryIds = userLibraries.map((lib) => lib.id);
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
      seriesWithThumbnailUrl.thumbnailUrl = `/api/image/thumbnails/${thumbnails[0].filePath.split("/").pop()}`;
      latestSeriesWithThumbnails.push(seriesWithThumbnailUrl);
    } else {
      latestSeriesWithThumbnails.push(series as ComicSeriesWithThumbnail);
    }
  }

  return latestSeriesWithThumbnails;
};

export const getUpdatedComicSeriesUserCanAccess = async (
  userId: number,
  limit: number = 20,
  offset: number = 0,
): Promise<Array<ComicSeriesWithThumbnail>> => {
  const userLibraries = await getUsersComicLibraries(userId);

  const libraryIds = userLibraries.map((lib) => lib.id);
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
      seriesWithThumbnailUrl.thumbnailUrl = `/api/image/thumbnails/${thumbnails[0].filePath.split("/").pop()}`;
      updatedSeriesWithThumbnails.push(seriesWithThumbnailUrl);
    } else {
      updatedSeriesWithThumbnails.push(series as ComicSeriesWithThumbnail);
    }
  }

  return updatedSeriesWithThumbnails;
};

export const getSelectedComicSeriesDetails = async (
  seriesId: number,
): Promise<ComicSeriesWithComicsMetadataAndThumbnail | null> => {
  const comicSeriesInfo: ComicSeries | null = await getComicSeriesById(
    seriesId,
  );
  if (!comicSeriesInfo) {
    return null;
  }

  const comicSeriesMetadata: ComicSeriesWithMetadata | null =
    await getComicSeriesMetadataById(seriesId);

  const comicBooksForCurrentSeries: Array<ComicBook> =
    await getComicBooksBySeriesId(comicSeriesInfo.id);
  if (comicBooksForCurrentSeries.length === 0) {
    return null;
  }

  const comicBooksForCurrentSeriesWithThumbnails: Array<
    ComicBookWithThumbnail
  > = [];
  for (const book of comicBooksForCurrentSeries) {
    const comicBookWithThumbnail: ComicBookWithThumbnail | null =
      await attachThumbnailToComicBook(book.id);
    if (comicBookWithThumbnail) {
      comicBooksForCurrentSeriesWithThumbnails.push(comicBookWithThumbnail);
    }
  }

  const seriesWithThumbnailUrl = comicSeriesInfo as ComicSeriesWithThumbnail;
  if (
    comicBooksForCurrentSeriesWithThumbnails &&
    comicBooksForCurrentSeriesWithThumbnails.length > 0
  ) {
    seriesWithThumbnailUrl.thumbnailUrl = comicBooksForCurrentSeriesWithThumbnails[0].thumbnailUrl || undefined;
  }

  const seriesWithComicsMetadataAndThumbnail = {
    ...seriesWithThumbnailUrl,
    metadata: comicSeriesMetadata ? { ...comicSeriesMetadata } : {},
    comics: comicBooksForCurrentSeriesWithThumbnails,
  };

  return seriesWithComicsMetadataAndThumbnail;
};
