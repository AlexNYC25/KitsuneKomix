
import { getUsersComicLibraries } from "../../db/sqlite/models/comicLibraries.model.ts";
import { getLatestComicSeries } from "../../db/sqlite/models/comicSeries.model.ts";
import { getThumbnailsByComicBookId } from "../../db/sqlite/models/comicBookThumbnails.model.ts";
import type { ComicSeries } from "../../types/index.ts";

type ComicSeriesWithThumbnail = ComicSeries & { thumbnailUrl?: string };

const CACHE_DIRECTORY = "/app/cache"; // Ensure this matches your actual cache directory TODO: move to config

export const getLatestComicSeriesUserCanAccess = async (
  userId: number,
  limit: number = 10,
  offset: number = 0,
): Promise<Array<ComicSeriesWithThumbnail>> => {
  // Placeholder implementation
  // In a real implementation, you would check the user's permissions and fetch the latest comic series accordingly
  console.log(
    `Fetching latest comic series for user ID: ${userId}, limit: ${limit}, offset: ${offset}`,
  );

  // Get the libraries the user has access to
  const userLibraries = await getUsersComicLibraries(userId);

  // pass the library IDs to the comic series query to filter results
  const libraryIds = userLibraries.map(lib => lib.id);
  const latestSeries = await getLatestComicSeries(limit, offset, libraryIds);
	const latestSeriesWithThumbnails: Array<ComicSeriesWithThumbnail> = [];
  // for the resulting series we then need to get the "first" comic in each series to get the cover image
  for (const series of latestSeries) {
    const thumbnails = await getThumbnailsByComicBookId(series.id);
    if (thumbnails && thumbnails.length > 0) {
			const seriesWithThumbnailUrl = series as ComicSeriesWithThumbnail;
      // Assuming the first thumbnail is the one we want TODO: improve this logic as we need to sort by some criteria so its not just the first record
      seriesWithThumbnailUrl.thumbnailUrl = thumbnails[0].file_path.replace(CACHE_DIRECTORY, "/api/image");
      latestSeriesWithThumbnails.push(seriesWithThumbnailUrl);
    }
		// TODO: handle case where no thumbnails are found, ideally we should have a default "no cover" image
		// If no thumbnails found, we can still push the series without a thumbnailUrl
		else {
			latestSeriesWithThumbnails.push(series as ComicSeriesWithThumbnail);
		}
	}

  // then we want to expose this image URL in the response, for now we return the file path directly, and 
	// set up a different endpoint to serve the image properly
	// in the future we might want to generate resized thumbnails and store those paths instead

  // Finally, return the list of comic series
  return latestSeriesWithThumbnails;
}