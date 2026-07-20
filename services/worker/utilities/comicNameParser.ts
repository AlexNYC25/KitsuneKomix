
const tokenPatterns = [
  {
    type: "YEAR",
    regex: /\((19|20)\d{2}\)/
  },
  {
    type: "ISSUE_COUNT",
    regex: /\((of|Of)\s\d{2}\)/
  },
  {
    type: "VOLUME",
    regex: /^v\d+/i
  },
  {
    type: "FORMAT",
    regex: /\((Digital|Scan|C2C)\)/gi
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
  volume: string | undefined,
  count: number | undefined,
  year: number | undefined,
  format: string | undefined,
  tags: string[]
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
      updatedString: fileName.replace(match.toString(), "")
    }

  }

  return {
    year: undefined,
    updatedString: fileName
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
    const rawMatchCount = match.replace("(", "").replace(")", "").replace("of", "").replace("Of", "").trim()

    return {
      totalIssueCount: parseInt(rawMatchCount),
      updatedString: fileName.replace(match.toString(), "")
    }

  }

  return {
    totalIssueCount: undefined,
    updatedString: fileName
  }
}

export const consumeTags = (fileName: string) => {

}

export const consumeFormat = (fileName: string) => {
}

export const consumeVolume = (fileName: string) => {

}

export const consumeIssue = (fileName: string) => {

}


export const tokenizeComicFileName = (fileName: string) => {

}

export const parseComicNameForDetails = (fileName: string): comicNameParserResult | any => {
  
  const yearInfo = consumeYear(fileName)
  fileName = yearInfo.updatedString

  const issueCountInfo = consumeIssueCount(fileName)
  fileName = issueCountInfo.updatedString


  return {
    year: yearInfo?.year || undefined,
    count: issueCountInfo?.totalIssueCount || undefined,
  } as comicNameParserResult
  
}