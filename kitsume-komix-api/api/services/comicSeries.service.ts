
import { getUsersComicLibraries } from "../../db/sqlite/models/comicLibraries.model.ts";
import { getLatestComicSeries } from "../../db/sqlite/models/comicSeries.model.ts";
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

  // then we want to expose this image URL in the response, for now we return the file path directly, and 
	// set up a different endpoint to serve the image properly
	// in the future we might want to generate resized thumbnails and store those paths instead

  // Finally, return the list of comic series
  return latestSeriesWithThumbnails;
}