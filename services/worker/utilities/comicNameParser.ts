
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
    regex: /\(?(volume|v)\s?\d{0,3}\)?/ig
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
    regex: /^#\d+/
  },
]

type comicNameParserResult = {
  seriesName: string | undefined,
  issue: string | undefined,
  volume: number | undefined,
  count: number | undefined,
  year: number | undefined,
  format: string | undefined,
  tags: string[]
}

export const removeFileExt = (fileName: string) => {
  const extPattern = tokenPatterns.find(i => (i.type === "FILE_EXT"))

  if (!extPattern) {
    return fileName
  }

  const matches: RegExpMatchArray | null = fileName.match(extPattern.regex)

  if (matches == null) {
    return fileName  
  }

  for (const match of matches) {
    const newFileName = fileName.replace(match.toString(), "")

    return newFileName
  }

  return fileName
}

export const consumeYear = (fileName: string) => {
  const yearTokenPattern = tokenPatterns.find(i => (i.type === "YEAR"))

  if (yearTokenPattern == undefined) {
    return {
      year: undefined,
      updatedString: fileName
    }
  }

  const matches: RegExpMatchArray | null = fileName.match(yearTokenPattern.regex)

  if (matches == null) {
    return {
      year: undefined,
      updatedString: fileName
    }
  }

  for (const match of matches) {
    const rawMatchYear = match.replace("(", "").replace(")", "")

    return {
      year: parseInt(rawMatchYear),
      updatedString: fileName.replace(match.toString().trim(), "")
    }

  }

  return {
    year: undefined,
    updatedString: fileName.trim()
  }
}

export const consumeIssueCount = (fileName: string) => {
  const issueCountPattern = tokenPatterns.find(i => i.type == "ISSUE_COUNT")

  if (issueCountPattern == undefined) {
    return {
      totalIssueCount: undefined,
      updatedString: fileName
    }
  }

  const matches: RegExpMatchArray | null = fileName.match(issueCountPattern.regex)

  if (matches == null ) {
    return {
      totalIssueCount: undefined,
      updatedString: fileName
    }
  }

  for (const match of matches) {
    const rawMatchCount = match.toLowerCase().replace("(", "").replace(")", "").replace("of", "").trim()

    return {
      totalIssueCount: parseInt(rawMatchCount),
      updatedString: fileName.replace(match.toString().trim(), "")
    }

  }

  return {
    totalIssueCount: undefined,
    updatedString: fileName.trim()
  }
}

export const consumeFormat = (fileName: string) => {
  const formatPattern = tokenPatterns.find(i => i.type == "FORMAT")

  if (formatPattern == undefined) {
    return {
      format: undefined,
      updatedString: fileName
    }
  }

  const matches: RegExpMatchArray | null = fileName.match(formatPattern.regex)

  if (matches == null ) {
    return {
      format: undefined,
      updatedString: fileName
    }
  }

  for (const match of matches) {
    const rawMatchCount = match.toLowerCase().replace("(", "").replace(")", "").trim()

    return {
      format: rawMatchCount,
      updatedString: fileName.replace(match.toString().trim(), "")
    }

  }

  return {
    format: undefined,
    updatedString: fileName.trim()
  }
}

export const consumeTags = (fileName: string) => {
  const tagCountPattern = tokenPatterns.find(i => i.type == "TAG")

  if (tagCountPattern == undefined) {
    return {
      tags: [],
      updatedString: fileName
    }
  }

  const matches: RegExpMatchArray | null = fileName.match(tagCountPattern.regex)

  if (!matches) {
    return {
      tags: [],
      updatedString: fileName
    }
  }

  const tags = []

  let finalName = fileName

  for (const match of matches) {
    tags.push(match.toString().trim().replace("(", "").replace(")", ""))

    finalName = finalName.replace(match.toString().trim(), "")
  }

  return {
    tags,
    updatedString: finalName.trim()
  }

}

export const consumeVolume = (fileName: string) => {
  const volumePattern = tokenPatterns.find(i => i.type == "VOLUME")

  if (volumePattern == undefined) {
    return {
      volume: undefined,
      updatedString: fileName
    }
  }

  const matches: RegExpMatchArray | null = fileName.match(volumePattern.regex)

  if (!matches) {
    return {
      volume: undefined,
      updatedString: fileName
    }
  }

  for (const match of matches) {
    const rawMatchCount = match.toLowerCase().replace("(", "").replace(")", "").replace("volume", "").replace("vol", "").replace("v", "").trim()

    if (!Number.isInteger(parseInt(rawMatchCount))){
      return {
        volume: undefined,
        updatedString: fileName
      }
    }

    return {
      volume: parseInt(rawMatchCount),
      updatedString: fileName.replace(match.toString().trim(), "")
    }

  }

  return {
    volume: undefined,
    updatedString: fileName.trim()
  }
}

export const consumeIssue = (fileName: string) => {

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


  return {
    year: yearInfo?.year || undefined,
    volume: volumeInfo?.volume || undefined,
    count: issueCountInfo?.totalIssueCount || undefined,
    format: formatInfo?.format || undefined,
    tags: tagsInfo.tags || undefined,
    seriesName: fileName
  } as comicNameParserResult
  
}