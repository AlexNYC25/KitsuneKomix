import type {
  ArchiveEntry,
  ConsolidatedPageInfo,
} from "../shared/types/utilities.types"

/**
 * Selects which images in the archive need a thumbnail generated.
 *
 * Always includes the first image alphabetically. When metadata pages are
 * provided, any page whose type is "FrontCover" is also included as a
 * thumbnail candidate.
 * @param files The archive's images in alphabetical order
 * @param metadataPages The page info gathered from the archive's metadata
 * @returns The candidate image files
 */
export const buildThumbnailCandidates = (
  files: ArchiveEntry[],
  metadataPages: ConsolidatedPageInfo[],
): ArchiveEntry[] => {
  const candidates: ArchiveEntry[] = []

  const firstFile = files[0]

  if (firstFile) {
    candidates.push(firstFile)
  }

  for (const page of metadataPages) {
    if (page.type !== "FrontCover") {
      continue
    }

    // ComicInfo page image numbers are 1-based indexes into the archive files
    const coverFile = files[page.image - 1]

    if (coverFile && !candidates.some((candidate) => candidate.path === coverFile.path)) {
      candidates.push(coverFile)
    }
  }

  return candidates
}