
const tokenPatterns = [
  {
    type: "YEAR",
    regex: /\((19|20)\d{2}\)/
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


  return {
    year: yearInfo?.year || undefined
  } as comicNameParserResult
  
}