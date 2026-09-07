export type ComicYearParserResult = {
  year: number | undefined,
  fileName: string
}

export type ComicIssueCountParserResult = {
  totalIssueCount: number | undefined,
  fileName: string
}

export type ComicFormatParserResult = {
  format: string| undefined,
  fileName: string
}

export type ComicIssueParserResult = {
  issue: string | undefined
  fileName: string
}

export type ComicVolumeParserResult = {
  volume: number | undefined,
  fileName: string
}

export type ComicTagsParserResult = {
  tags: string[];
  fileName: string;
}

export type ComicNameParserResult = {
  seriesName: string | undefined,
  issue: string | undefined,
  volume: number | undefined,
  count: number | undefined,
  year: number | undefined,
  format: string | undefined,
  tags: string[]
}

export type List7zzFileOutput = {
  date: string,
  time: string,
  attr: string,
  size: string,
  compressed: string,
  name: string
}

export interface ArchiveEntry {
  path: string,
  size: number,
}

export interface ArchiveManifest {
  type: string,
  archiveSize: number,
  hash: number | bigint | undefined

  metadataExists: boolean

  files: ArchiveEntry[]
}

export interface ArchiveReader {
  getManifest(filePath: string): Promise<ArchiveManifest>
}

/**
 * A normalized credit (creator) with a role.
 * Used to gather creators from every metadata source into one list.
 */
export interface ConsolidatedCredit {
  person: string
  role: string
}

/**
 * A normalized page entry found in a comic file.
 */
export interface ConsolidatedPageInfo {
  image: number
  type?: string
  doublePage?: boolean
  imageSize?: number
  key?: string
  bookmark?: string
  imageWidth?: number
  imageHeight?: number
}

/**
 * A single consolidated object merging the possible metadata sources that
 * can be found inside a comic archive (ComicInfo.xml, CoMet, ComicBookInfo).
 *
 * Fields that commonly repeat across sources carry the value taken from the
 * highest priority source that provided it, while exclusive values are
 * gathered from any source that contains them.
 */
export interface ConsolidatedComicMetadata {
  title: string | undefined
  series: string | undefined
  issueNumber: string | undefined
  count: number | undefined
  volumeNumber: string | undefined

  alternateSeries: string | undefined
  alternateIssueNumber: string | undefined
  alternateCount: number | undefined
  alternateVolumeNumber: string | undefined

  pageCount: number | undefined
  year: number | undefined
  month: number | undefined
  day: number | undefined
  publicationDate: string | undefined

  publisher: string | undefined
  imprint: string | undefined
  summary: string | undefined
  notes: string | undefined
  language: string | undefined
  format: string | undefined
  web: string | undefined

  blackAndWhite: boolean | string | undefined
  manga: boolean | string | undefined
  readingDirection: "ltr" | "rtl" | undefined

  ageRating: string | undefined
  communityRating: number | undefined
  review: string | undefined
  scanInfo: string | undefined

  genres: string[]
  storyArcs: string[]
  seriesGroups: string[]
  characters: string[]
  teams: string[]
  locations: string[]
  credits: ConsolidatedCredit[]
  pages: ConsolidatedPageInfo[]
  tags: string[]
}

/**
 * A summary of the entities recorded when persisting a comic book's
 * consolidated metadata. Each count reflects the number of entities
 * successfully recorded for that type.
 */
export type ComicMetadataInsertionResult = {
  genres: number
  publishers: number
  imprints: number
  credits: number
  characters: number
  teams: number
  locations: number
  storyArcs: number
  seriesGroups: number
  webLinks: number
}
