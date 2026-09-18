import sharp from "sharp";

import { env } from "../config/env"

/**
 * The target size for generated thumbnails. The largest side of the thumbnail
 * is resized to this many pixels while preserving the aspect ratio (matches the
 * ComicInfo.xml thumbnail convention).
 */
export const THUMBNAIL_MAX_DIMENSION = 640

/**
 * Resizes image bytes to a thumbnail, preserving the aspect ratio and scaling
 * the largest side down to the thumbnail max dimension. Images smaller than the
 * target are never enlarged. The result is always encoded as JPEG.
 * @param source The source image bytes
 * @returns The generated thumbnail bytes
 */
export const createThumbnail = async (source: ArrayBuffer): Promise<Buffer> => {
  const thumbnail: Buffer = await sharp(source)
    .resize(THUMBNAIL_MAX_DIMENSION, THUMBNAIL_MAX_DIMENSION, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg()
    .toBuffer();

  return thumbnail
}

/**
 * The directory a comic book's thumbnails are stored in on the cache volume
 * @param comicBookId The ID of the comic book
 * @returns An absolute path to the comic book's thumbnails directory
 */
export const getThumbnailDirectoryPath = (comicBookId: number): string => {
  return `${env.APP_CACHE_PATH}/thumbnails/${comicBookId}`
}

/**
 * The on-disk path for a comic book's thumbnail given the source image path
 * inside the archive. The original extension is replaced with .jpg since
 * thumbnails are always re-encoded to JPEG.
 * @param comicBookId The ID of the comic book
 * @param sourceImagePath The image's path as stored inside the archive
 * @returns An absolute path to the thumbnail file
 */
export const getThumbnailFilePath = (comicBookId: number, sourceImagePath: string): string => {
  const sourceFileName: string = sourceImagePath.split("/").at(-1) ?? "cover"

  const baseName: string = sourceFileName.split(".").at(-2) ?? sourceFileName

  return `${getThumbnailDirectoryPath(comicBookId)}/${baseName}.jpg`
}