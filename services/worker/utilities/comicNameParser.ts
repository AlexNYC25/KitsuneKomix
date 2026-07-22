
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

type ComicYearParserResult = {
  year: number | undefined,
  updatedString: string
}

type ComicIssueCountParserResult = {
  totalIssueCount: number | undefined,
  updatedString: string
}

type ComicFormatParserResult = {
  format: string| undefined,
  updatedString: string
}

type ComicIssueParserResult = {
  issue: string | undefined
  updatedString: string
}

type ComicVolumeParserResult = {
  volume: number | undefined,
  updatedString: string
}

type ComicTagsParserResult = {
  tags: string[];
  updatedString: string;
}

type comicNameParserResult = {
  seriesName: string | undefined,
  issue: string | undefined,
  volume: number | undefined,
  count: number | undefined,
  year: number | undefined,
  format: string | undefined,
  tags: string[]
}

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
    updatedString: fileName
  } as ComicYearParserResult

  if (yearPattern == undefined) {
    return defaultReturn
  }

  const match: RegExpMatchArray | null = fileName.match(yearPattern)

  if (!match) {
    return defaultReturn
  }

  const rawMatchYear: string = match[0].replace("(", "").replace(")", "")

  return {
    year: parseInt(rawMatchYear),
    updatedString: fileName.replace(match[0].toString(), "").trim()
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
    updatedString: fileName
  } as ComicIssueCountParserResult

  if (extPattern == undefined) {
    return defaultReturn
  }

  const match: RegExpMatchArray | null = fileName.match(extPattern)

  if (!match) {
    return defaultReturn
  }

  const rawMatchCount: string = match[0].toLowerCase().replace("(", "").replace(")", "").replace("of", "")

  return {
    totalIssueCount: parseInt(rawMatchCount),
    updatedString: fileName.replace(match[0].toString(), "").trim()
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
    updatedString: fileName
  } as ComicFormatParserResult

  if (!extPattern) {
    return defaultReturn
  }

  const match: RegExpMatchArray | null = fileName.match(extPattern)

  if (!match) {
    return defaultReturn
  }

  const rawMatchCount: string = match[0].toLowerCase().replace("(", "").replace(")", "")

  return {
    format: rawMatchCount,
    updatedString: fileName.replace(match[0].toString(), "").trim()
  }
}

/**
 * 
 * @param fileName The file name of the comic book file
 * @returns 
 */
export const consumeTags = (fileName: string): ComicTagsParserResult => {
  const extPattern: RegExp | undefined = lookUpRegex("TAG")

  const defaultReturn = {
    tags: [],
    updatedString: fileName
  }

  if (!extPattern) {
    return defaultReturn
  }

  const matches: RegExpMatchArray | null = fileName.match(extPattern)

  if (!matches) {
    return defaultReturn
  }

  const tags = []

  let finalName = fileName

  for (const match of matches) {
    tags.push(match.toString().trim().replace("(", "").replace(")", ""))

    finalName = finalName.replace(match.toString(), "").trim()
  }

  return {
    tags,
    updatedString: finalName.trim()
  }

}

export const consumeVolume = (fileName: string): ComicVolumeParserResult => {
  const volumePattern = lookUpRegex("VOLUME")

  const defaultReturn = {
    updatedString: fileName
  } as ComicVolumeParserResult

  if (!volumePattern) {
    return defaultReturn
  }

  const match: RegExpMatchArray | null = fileName.match(volumePattern)

  if (!match) {
    return defaultReturn
  }

  const rawMatchCount = match[0].toLowerCase().replace("(", "").replace(")", "").replace("volume", "").replace("vol", "").replace("v", "").trim()

  return {
    volume: parseInt(rawMatchCount),
    updatedString: fileName.replace(match[0].toString().trim(), "")
  }
}

export const consumeIssue = (fileName: string): ComicIssueParserResult => {
  const issuePattern = lookUpRegex("ISSUE")

  const defaultReturn = {
    updatedString: fileName
  } as ComicIssueParserResult

  if (!issuePattern) {
    return defaultReturn
  }
  
  const match: RegExpMatchArray | null = fileName.match(issuePattern)

  if (!match) {
    return defaultReturn
  }

  const rawMatchCount = match[0].toLowerCase().replace("#", "").trim()

  return {
    issue: rawMatchCount.replace(/^0/, ''),
    updatedString: fileName.replace(match[0].toString().trim(), "").trim()
  }

}

export const parseComicNameForDetails = (fileName: string): comicNameParserResult | any => {

  fileName = removeFileExt(fileName)
  
  const yearInfo = consumeYear(fileName)
  fileName = yearInfo.updatedString

  const issueCountInfo = consumeIssueCount(fileName)
  fileName = issueCountInfo.updatedString

  const formatInfo = consumeFormat(fileName)
  fileName = formatInfo.updatedString

  const volumeInfo = consumeVolume(fileName)
  fileName = volumeInfo.updatedString

  const tagsInfo = consumeTags(fileName)
  fileName = tagsInfo.updatedString

  const issueInfo = consumeIssue(fileName)
  fileName = issueInfo.updatedString


  return {
    issue: issueInfo?.issue || undefined,
    year: yearInfo?.year || undefined,
    volume: volumeInfo?.volume || undefined,
    count: issueCountInfo?.totalIssueCount || undefined,
    format: formatInfo?.format || undefined,
    tags: tagsInfo.tags || undefined,
    seriesName: fileName
  } as comicNameParserResult
  
}