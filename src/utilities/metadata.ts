import { readComicFileMetadata } from "comic-metadata-tool"

/**
 * Uses the comic-metadata-tool to read metadata from a comic file.
 * @param filePath 
 * @returns A promise that resolves to the metadata object or null if an error occurs.
 * @throws Will log an error if metadata reading fails.
 */
export async function getMetadata(filePath: string) {
  try {
    const metadata = await readComicFileMetadata(filePath);
    return metadata;
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return null;
  }
}