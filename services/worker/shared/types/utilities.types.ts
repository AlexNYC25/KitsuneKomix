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

  files: ArchiveEntry[]
}

export interface ArchiveReader {
  getManifest(filePath: string): Promise<ArchiveManifest>
}