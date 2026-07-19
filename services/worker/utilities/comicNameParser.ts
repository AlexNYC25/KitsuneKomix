
const tokenPatterns = [
  {
    type: "YEAR",
    regex: /^\((19|20)\d{2}\)/
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

export const consumeYear = (fileName: string) => {

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