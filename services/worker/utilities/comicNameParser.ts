import type {
  ComicYearParserResult,
  ComicIssueCountParserResult,
  ComicFormatParserResult,
  ComicIssueParserResult,
  ComicVolumeParserResult,
  ComicTagsParserResult,
  ComicNameParserResult
} from "../shared/types/utilities.types"


const tokenPatterns = [
  {
    type: "FILE_EXT",
    regex: /[.][a-z]{2,3}/
  },
  {
    type: "YEAR",
    regex: /\((19|20)\d{2}\)/
  },
  {
    type: "ISSUE_COUNT",
    regex: /\(of\s\d{2}\)/i
  },
  {
    type: "VOLUME",
    regex: /\(?(volume|vol|v)\s?\d{0,3}\)?/i
  },
  {
    type: "FORMAT",
    regex: /\((Digital|Scan|C2C)\)/i
  },
  {
    type: "TAG",
    regex: /\(((?!\d{4}\))[^()]*)\)/g
  },
  {
    type: "ISSUE",
    regex: /(#\d+|[0]\d+|\d{4})$/g
  },
]

const lookUpRegex = (patternType: string): RegExp | undefined => {
  const tokenRegexPattern = tokenPatterns.find(i => i.type === patternType)

  if (tokenRegexPattern) {
    return tokenRegexPattern.regex
  }

  return undefined;
}

/**
 * Removed the extension from the file name
 * @param fileName The file name of the comic book file
 * @returns Modified string without file extension or falls back to the original string
 */
export const removeFileExt = (fileName: string): string => {
  const extPattern: RegExp | undefined = lookUpRegex("FILE_EXT")

  if (!extPattern) {
    return fileName
  }

  const match: RegExpMatchArray | null = fileName.match(extPattern)

  if (match == null) {
    return fileName  
  }

  const newFileName: string = fileName.replace(match[0].toString(), "")

  return newFileName
}

/**
 * Parses and remove the year integer value from the file name string
 * @param fileName The file name of the comic book file
 * @returns An ComicYearParserResult with the parsed year value and the updated string with the updated string without the year token
 */
export const consumeYear = (fileName: string) : ComicYearParserResult => {
  const yearPattern: RegExp | undefined = lookUpRegex("YEAR")

  const defaultReturn: ComicYearParserResult = {
    fileName: fileName
  } as ComicYearParserResult

  if (yearPattern == undefined) {
    return defaultReturn
  }

  const match: RegExpMatchArray | null = fileName.match(yearPattern)

  if (!match) {
    return defaultReturn
  }

  const rawYearMatch: string = match[0]
  const cleanedYearMatch: string = rawYearMatch.replace("(", "").replace(")", "")

  return {
    year: parseInt(cleanedYearMatch),
    fileName: fileName.replace(rawYearMatch.toString(), "").trim()
  }
}

/**
 * Parses and remove the issue count from the file name string
 * @param fileName The file name of the comic book file
 * @returns An ComicIssueCountParserResult
 */
export const consumeIssueCount = (fileName: string): ComicIssueCountParserResult => {
  const extPattern: RegExp | undefined = lookUpRegex("ISSUE_COUNT")

  const defaultReturn = {
    fileName: fileName
  } as ComicIssueCountParserResult

  if (extPattern == undefined) {
    return defaultReturn
  }

  const match: RegExpMatchArray | null = fileName.match(extPattern)

  if (!match) {
    return defaultReturn
  }

  const rawIssueCountMatch: string = match[0]
  const cleanedIssueCountMatch: string = rawIssueCountMatch.toLowerCase().replace("(", "").replace(")", "").replace("of", "")

  return {
    totalIssueCount: parseInt(cleanedIssueCountMatch),
    fileName: fileName.replace(rawIssueCountMatch.toString(), "").trim()
  }
}

/**
 * Parses and remove the format from the file name string
 * @param fileName The file name of the comic book file
 * @returns An ComicFormatParserResult
 */
export const consumeFormat = (fileName: string): ComicFormatParserResult => {
  const extPattern: RegExp | undefined = lookUpRegex("FORMAT")

  const defaultReturn = {
    fileName: fileName
  } as ComicFormatParserResult

  if (!extPattern) {
    return defaultReturn
  }

  const match: RegExpMatchArray | null = fileName.match(extPattern)

  if (!match) {
    return defaultReturn
  }

  const rawFormatMatch: string = match[0]
  const cleanedFormatMatch: string = rawFormatMatch.toLowerCase().replace("(", "").replace(")", "")

  return {
    format: cleanedFormatMatch,
    fileName: fileName.replace(rawFormatMatch.toString(), "").trim()
  }
}

/**
 * Parses and removes the tags found in the file name
 * @param fileName The file name of the comic book file
 * @returns An ComicTagsParserResult object
 */
export const consumeTags = (fileName: string): ComicTagsParserResult => {
  const extPattern: RegExp | undefined = lookUpRegex("TAG")

  const defaultReturn = {
    tags: [],
    fileName: fileName
  }

  if (!extPattern) {
    return defaultReturn
  }

  const matches: RegExpMatchArray | null = fileName.match(extPattern)

  if (!matches) {
    return defaultReturn
  }

  const tags: string[] = []
  let finalName: string = fileName

  for (const match of matches) {
    const cleanedMatch: string = match.toString().trim().replace("(", "").replace(")", "")
    tags.push(cleanedMatch)

    finalName = finalName.replace(match.toString(), "").trim()
  }

  return {
    tags,
    fileName: finalName.trim()
  }

}

/**
 * Parses and removes the volume info from the file name
 * @param fileName The file name of the comic book file
 * @returns An ComicVolumeParserResult object
 */
export const consumeVolume = (fileName: string): ComicVolumeParserResult => {
  const volumePattern: RegExp | undefined = lookUpRegex("VOLUME")

  const defaultReturn = {
    fileName: fileName
  } as ComicVolumeParserResult

  if (!volumePattern) {
    return defaultReturn
  }

  const match: RegExpMatchArray | null = fileName.match(volumePattern)

  if (!match) {
    return defaultReturn
  }

  const rawVolumeMatch: string = match[0]
  const cleanedVolumeMatch: string = rawVolumeMatch
    .toLowerCase()
    .replace("(", "")
    .replace(")", "")
    .replace("volume", "")
    .replace("vol", "")
    .replace("v", "")
    .trim()

  return {
    volume: parseInt(cleanedVolumeMatch),
    fileName: fileName.replace(rawVolumeMatch.toString().trim(), "")
  }
}

/**
 * Parses and removes the issue info from the filename string
 * @param fileName The file name of the comic book file
 * @returns An ComicIssueParserResult object
 */
export const consumeIssue = (fileName: string): ComicIssueParserResult => {
  const issuePattern: RegExp | undefined = lookUpRegex("ISSUE")

  const defaultReturn = {
    fileName: fileName
  } as ComicIssueParserResult

  if (!issuePattern) {
    return defaultReturn
  }
  
  const match: RegExpMatchArray | null = fileName.match(issuePattern)

  if (!match) {
    return defaultReturn
  }

  const rawIssueMatch: string = match[0]
  const cleanedIssueMatch: string = rawIssueMatch.toLowerCase().replace("#", "").replace(/^0/, '').trim()

  return {
    issue: cleanedIssueMatch,
    fileName: fileName.replace(rawIssueMatch.toString().trim(), "").trim()
  }

}

/**
 * Parses and separates out the comic info details from the comic file name
 * @param fileName The file name of the comic book file
 * @returns An ComicNameParserResult object
 */
export const parseComicNameForDetails = (fileName: string): ComicNameParserResult | any => {

  fileName = removeFileExt(fileName)
  
  const yearInfo: ComicYearParserResult = consumeYear(fileName)
  fileName = yearInfo.fileName

  const issueCountInfo: ComicIssueCountParserResult = consumeIssueCount(fileName)
  fileName = issueCountInfo.fileName

  const formatInfo: ComicFormatParserResult = consumeFormat(fileName)
  fileName = formatInfo.fileName

  const volumeInfo: ComicVolumeParserResult = consumeVolume(fileName)
  fileName = volumeInfo.fileName

  const tagsInfo: ComicTagsParserResult = consumeTags(fileName)
  fileName = tagsInfo.fileName

  const issueInfo: ComicIssueParserResult = consumeIssue(fileName)
  fileName = issueInfo.fileName

  return {
    issue: issueInfo?.issue || undefined,
    year: yearInfo?.year || undefined,
    volume: volumeInfo?.volume || undefined,
    count: issueCountInfo?.totalIssueCount || undefined,
    format: formatInfo?.format || undefined,
    tags: tagsInfo.tags || undefined,
    seriesName: fileName
  } as ComicNameParserResult
  
}