
import { env } from "@/config/env"
import { composeStaticUrl } from '@/utilities/apiClient'
import { resolveImageSrc } from '@/utilities/image';

/**
 * 
 * @param filePath The file name of the thumbnail
 * @returns the relateive url of the thumbnail
 *
 * 
 * Note: This is currently used for using the file name to get a real url to fetch the thumbnail
 * from the server.
 */
export const getThumbnailPathFromFilePath = (filePath?: string | null): string | null => {
	if (!filePath) {
		return null;
	}

	const filename = filePath.split('/').pop();
	if (!filename) {
		return null;
	}

	return `/api/image/thumbnails/${filename}`;
};

/**
 * Used to buiild url's for use in standard fetch requests to download them from the server
 * @param comicId 
 * @returns A url that can be used to request the file from the server
 */
export const buildComicDownloadUrl = (comicId: number) => {

	return env.API_URL + `/api/comic-books/${comicId}/download`
}

/**
 * Used to build the absolute url path for the thumbnail representing a comic series
 * @param seriesThumbnailPath 
 * @returns undefined if the path is not valid or a url
 */
export const buildComicThumbnailUrl = (seriesThumbnailPath?: string | null) => {
	if (!seriesThumbnailPath) {
		return undefined;
	}

	return env.API_URL + seriesThumbnailPath
}

/**
 * Used to build the url for the comic reader to use to request the image for the comic page
 * @param comicId
 * @param comicPagePath
 * 
 * @returns A url that can be used to request the comic page's image
 */
export const buildComicPageUrl = async (comicId: number, comicPagePath: string) => {
	const pageFilename = comicPagePath.split('/').pop();
	const pageUrl = composeStaticUrl(`/api/image/comic-book/${comicId}/page/${pageFilename}`);
	const resolvedImageUrl = await resolveImageSrc(pageUrl);

	return resolvedImageUrl;
}