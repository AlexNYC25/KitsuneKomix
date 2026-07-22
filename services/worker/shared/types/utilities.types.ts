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