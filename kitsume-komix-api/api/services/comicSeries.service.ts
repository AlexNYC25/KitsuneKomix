import { getUsersComicLibraries } from "#sqlite/models/comicLibraries.model.ts";
import {
  getComicSeriesById,
  getComicSeriesMetadataById,
  getLatestComicSeries,
  getUpdatedComicSeries,
  getComicSeriesWithMetadataFilteringSorting,
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
  ComicSeriesFilterItem,
  ComicSeriesWithMetadataAndThumbnail,
  ComicSeriesWithComicsMetadataAndThumbnail,
  RequestParametersValidated,
  ComicSeriesSortField,
  ComicSeriesFilterField,
  RequestPaginationParametersValidated,
  RequestFilterParametersValidated,
  RequestSortParametersValidated,
} from "#types/index.ts";

export const fetchComicSeries = async (
  queryData: RequestParametersValidated<ComicSeriesSortField, ComicSeriesFilterField>,
): Promise<ComicSeriesWithThumbnail[]> => {
  try {
    const serviceDataPagination: RequestPaginationParametersValidated = queryData.pagination;
    const serviceDataFilter: RequestFilterParametersValidated<ComicSeriesFilterField> | undefined = queryData.filter;
    const serviceDataSort: RequestSortParametersValidated<ComicSeriesSortField> = queryData.sort;

    const comicSeriesFromDb: ComicSeries[] = await getComicSeriesWithMetadataFilteringSorting({
      filters: [serviceDataFilter] as ComicSeriesFilterItem[], // Cast to expected type
      sort: {
        property: serviceDataSort.sortProperty,
        order: serviceDataSort.sortOrder
      },
      offset: serviceDataPagination.pageNumber * serviceDataPagination.pageSize,
      limit: serviceDataPagination.pageSize + 1
    });

    // Request the overview comic series data i.e. how many books, date range, writers, artists, etc
    // and attatch the thumbnail url for the first comic book in the series if it exists

    return []
  } catch (error) {
    throw new Error("Error fetching comic series: " + (error instanceof Error ? error.message : String(error)));
  }
};

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
