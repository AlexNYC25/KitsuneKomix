import type { ArchiveEntry, ArchiveManifest, List7zzFileOutput } from "../shared/types/utilities.types"

import { list } from "./7zz.wraper";
import { parseListOutput } from "./7zzParser";
import { generateHashForFile } from "./hash"

const imageFileExtensions = ["jpeg", "png", "webp", "gif", "svg"]

/**
 * Filters the entries so only pages remain and formats them into ArchiveEntry objects
 * @param archiveEntries The full list of all entries in the archive
 * @returns ArchiveEntry[] with only image file types in the archive
 */
const filterPages = (archiveEntries: List7zzFileOutput[]): ArchiveEntry[] => {
  const pagesThatAreImagesPages: ArchiveEntry[] = [];

  for (const entry of archiveEntries) {
    const fileName: string | undefined = entry.name.split("/").at(-1)

    if (!fileName || !fileName.includes(".")) {
      continue
    }

    const fileExt = fileName.split(".").at(-1)

    if (fileExt && imageFileExtensions.includes(fileExt)) {
      pagesThatAreImagesPages.push({
        path: entry.name,
        size: parseInt(entry.size)
      })
    }

  }

  return pagesThatAreImagesPages
}

/**
 * Parses an archive file and returns a manifest with the pages listed in the file as well as some basic info
 * about the archive + pages
 * @param filePath Path to a archive file
 * @returns Either a ArchiveManifest file if the file path is to a file that exists undefined otherwise
 */
export const getArchivesManifest = async (filePath: string): Promise<ArchiveManifest | undefined > => {

  const fileInfo: Bun.BunFile = Bun.file(filePath)
  const doesTheFileExist: boolean = await fileInfo.exists()

  if (!doesTheFileExist) {
    return undefined;
  }

  const listOutput: string = await list(filePath);

  const parsedOutput: List7zzFileOutput[] = parseListOutput(listOutput)


  const pages: ArchiveEntry[] = filterPages(parsedOutput)

  const archiveSize: number = fileInfo.size

  const type: string = filePath.split(".").at(-1) || "unknown";
  
  const fileHash: bigint | number = await generateHashForFile(filePath)

  const manifest: ArchiveManifest = {
    type: type,
    archiveSize: archiveSize,
    hash: fileHash,

    files: pages
  }

  return manifest;
}