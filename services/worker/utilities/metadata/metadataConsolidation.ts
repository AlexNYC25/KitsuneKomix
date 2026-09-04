import type {
  MetadataCompiled,
  ComicInfo,
  CoMet,
  ComicBookInfoPayload,
} from "comic-metadata-tool"
import type {
  ConsolidatedComicMetadata,
} from "../../shared/types/utilities.types"
import {
  firstDefined,
  firstDefinedString,
  firstDefinedNumber,
  splitCsv,
  uniqueStrings,
  gatherCredits,
  gatherPages,
} from "./metadataConsolidationHelpers"

/**
 * Consolidates the possible metadata sources found within a single comic
 * archive file into one normalized object.
 *
 * Because the same piece of information (series, issue, publisher, year, ...)
 * can appear in more than one source and some values are exclusive to a given
 * source, the function applies a source priority and merges exclusive
 * multi-valued data together.
 *
 * Priority (highest first): ComicInfo.xml > ComicBookInfo > CoMet
 *
 * @param metadata The compiled metadata object returned by `readComicFileMetadata`
 * @returns A single consolidated metadata object
 */
export const consolidateComicMetadata = (
  metadata: MetadataCompiled,
): ConsolidatedComicMetadata => {
  const { comicInfoXml, coMet } = metadata
  const comicBookInfoPayload: ComicBookInfoPayload | undefined = comicBookInfoPayloadOf(metadata)

  // return the consolidated info 
  return {
    ...resolveIdentifiers(comicInfoXml, coMet, comicBookInfoPayload),
    ...resolveAlternates(comicInfoXml),
    ...resolvePages(comicInfoXml, coMet),
    ...resolvePublicationDate(comicInfoXml, coMet, comicBookInfoPayload),
    ...resolveDetails(comicInfoXml, coMet, comicBookInfoPayload),
    ...resolveRatings(comicInfoXml, coMet, comicBookInfoPayload),
    ...resolvePresentation(comicInfoXml, coMet),
    ...resolveCollections(comicInfoXml, coMet, comicBookInfoPayload),
  }
}

/**
 * Checks the compiled metadata for a ComicBookInfo payload and returns it if found.
 * @param metadata The compiled metadata object returned by `readComicFileMetadata`
 * @returns The ComicBookInfo payload if found, otherwise undefined
 */
const comicBookInfoPayloadOf = (
  metadata: MetadataCompiled,
): ComicBookInfoPayload | undefined => {
  // TODO: Check if this is always the same info property name, or if it can be different
  return metadata.comicbookinfo?.["ComicBookInfo/1.0"]
}

const resolveIdentifiers = (
  comicInfoXml?: ComicInfo,
  coMet?: CoMet,
  comicBookInfoPayload?: ComicBookInfoPayload,
) => ({
  title: firstDefinedString(
    comicInfoXml?.title,
    comicBookInfoPayload?.title,
    coMet?.title,
  ),
  series: firstDefinedString(
    comicInfoXml?.series,
    comicBookInfoPayload?.series,
    coMet?.series,
  ),
  issueNumber: firstDefinedString(
    comicInfoXml?.number,
    comicBookInfoPayload?.issue?.toString(),
    coMet?.issue?.toString(),
  ),
  volumeNumber: firstDefinedString(
    comicInfoXml?.volume?.toString(),
    comicBookInfoPayload?.volume?.toString(),
    coMet?.volume?.toString(),
  ),
  count: firstDefinedNumber(
    comicInfoXml?.count,
    comicBookInfoPayload?.numberOfIssues,
  ),
})

const resolveAlternates = (comicInfoXml?: ComicInfo) => ({
  alternateSeries: firstDefinedString(comicInfoXml?.alternateSeries),
  alternateIssueNumber: firstDefinedString(comicInfoXml?.alternateNumber),
  alternateCount: firstDefinedNumber(comicInfoXml?.alternateCount),
  alternateVolumeNumber: undefined,
})

const resolvePages = (comicInfoXml?: ComicInfo, coMet?: CoMet) => ({
  pageCount: firstDefinedNumber(
    comicInfoXml?.pageCount,
    comicInfoXml?.pages?.length,
    coMet?.pages?.length,
  ),
  pages: gatherPages(comicInfoXml, coMet),
})

const resolvePublicationDate = (
  comicInfoXml?: ComicInfo,
  coMet?: CoMet,
  comicBookInfoPayload?: ComicBookInfoPayload,
) => {
  const coMetDate = parseCoMetDate(coMet?.date)

  return {
    year: firstDefinedNumber(
      comicInfoXml?.year,
      comicBookInfoPayload?.publicationYear,
      coMetDate.year,
    ),
    month: firstDefinedNumber(
      comicInfoXml?.month,
      comicBookInfoPayload?.publicationMonth,
      coMetDate.month,
    ),
    day: firstDefinedNumber(comicInfoXml?.day, coMetDate.day),
    publicationDate: firstDefinedString(
      buildDateString(comicInfoXml?.year, comicInfoXml?.month, comicInfoXml?.day),
      coMet?.date,
      comicBookInfoPayload?.publicationYear !== undefined
        ? String(comicBookInfoPayload.publicationYear)
        : undefined,
    ),
  }
}

/**
 * Extracts the discrete year, month and day from a CoMet ISO date
 * (YYYY-MM-DD). Any missing component stays undefined.
 */
const parseCoMetDate = (
  date?: string,
): { year?: number; month?: number; day?: number } => {
  if (!date) {
    return {}
  }

  const groups = date.match(/^(\d{4})-(\d{2})-(\d{2})/)

  if (groups) {
    return {
      year: Number(groups[1]),
      month: Number(groups[2]),
      day: Number(groups[3]),
    }
  }

  // Fall back to just the year when the date isn't a full YYYY-MM-DD.
  const yearMatch = date.match(/\d{4}/)
  return yearMatch ? { year: Number(yearMatch[0]) } : {}
}

const buildDateString = (
  year?: number,
  month?: number,
  day?: number,
): string | undefined => {
  const parts = [year, month, day]
    .filter((v): v is number => v !== undefined)
    .map(v => v.toString().padStart(v > 999 ? 4 : 2, "0"))

  return parts.length > 0 ? parts.join("-") : undefined
}

const resolveDetails = (
  comicInfoXml?: ComicInfo,
  coMet?: CoMet,
  comicBookInfoPayload?: ComicBookInfoPayload,
) => ({
  publisher: firstDefinedString(
    comicInfoXml?.publisher,
    comicBookInfoPayload?.publisher,
    coMet?.publisher,
  ),
  imprint: firstDefinedString(comicInfoXml?.imprint),
  summary: firstDefinedString(comicInfoXml?.summary, coMet?.description),
  notes: firstDefinedString(comicInfoXml?.notes, comicBookInfoPayload?.comments),
  language: firstDefinedString(
    comicInfoXml?.languageISO,
    comicBookInfoPayload?.language,
    coMet?.language,
  ),
  format: firstDefinedString(comicInfoXml?.format, coMet?.format),
  web: firstDefinedString(comicInfoXml?.web, coMet?.identifier, coMet?.isVersionOf),
  scanInfo: firstDefinedString(comicInfoXml?.scanInformation),
})

const resolveRatings = (
  comicInfoXml?: ComicInfo,
  coMet?: CoMet,
  comicBookInfoPayload?: ComicBookInfoPayload,
) => ({
  ageRating: firstDefinedString(
    comicInfoXml?.ageRating,
    coMet?.rating,
    comicBookInfoPayload?.rating?.toString(),
  ),
  communityRating: firstDefinedNumber(
    comicInfoXml?.communityRating,
    comicBookInfoPayload?.rating,
  ),
  review: firstDefinedString(comicInfoXml?.review),
})

const resolvePresentation = (comicInfoXml?: ComicInfo, coMet?: CoMet) => ({
  blackAndWhite: firstDefined(comicInfoXml?.blackAndWhite),
  manga: firstDefined(comicInfoXml?.manga),
  readingDirection: firstDefined(coMet?.readingDirection),
})

const resolveCollections = (
  comicInfoXml?: ComicInfo,
  coMet?: CoMet,
  comicBookInfoPayload?: ComicBookInfoPayload,
) => ({
  genres: uniqueStrings([
    splitCsv(comicInfoXml?.genre),
    coMet?.genre,
    splitCsv(comicBookInfoPayload?.genre),
  ]),
  storyArcs: uniqueStrings([splitCsv(comicInfoXml?.storyArc)]),
  seriesGroups: uniqueStrings([splitCsv(comicInfoXml?.seriesGroup)]),
  characters: uniqueStrings([
    splitCsv(comicInfoXml?.characters),
    coMet?.character,
  ]),
  teams: uniqueStrings([splitCsv(comicInfoXml?.teams)]),
  locations: uniqueStrings([splitCsv(comicInfoXml?.locations)]),
  tags: uniqueStrings([comicBookInfoPayload?.tags]),
  credits: gatherCredits(comicInfoXml, coMet, comicBookInfoPayload),
})
