import type {
  MetadataCompiled,
  ComicInfo,
  CoMet,
  ComicBookInfo,
  ComicBookInfoPayload,
  CreditEntry
} from "comic-metadata-tool"
import type {
  ConsolidatedComicMetadata,
  ConsolidatedCredit,
  ConsolidatedPageInfo
} from "../shared/types/utilities.types"

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
  const comicInfoXml: ComicInfo | undefined = metadata.comicInfoXml
  const comicBookInfo: ComicBookInfo | undefined = metadata.comicbookinfo
  const coMet: CoMet | undefined = metadata.coMet

  const comicBookInfoPayload: ComicBookInfoPayload | undefined =
    comicBookInfo?.["ComicBookInfo/1.0"]

  const firstDefined = <T>(...values: (T | undefined)[]): T | undefined => {
    for (const value of values) {
      if (value !== undefined && value !== null && value !== "") {
        return value
      }
    }
    return undefined
  }

  const firstDefinedString = (...values: (string | undefined)[]): string | undefined => {
    for (const value of values) {
      if (value !== undefined && value !== null && value.trim() !== "") {
        return value.trim()
      }
    }
    return undefined
  }

  const firstDefinedNumber = (...values: (number | undefined)[]): number | undefined => {
    for (const value of values) {
      if (value !== undefined && value !== null) {
        return value
      }
    }
    return undefined
  }

  const issueNumber = firstDefinedString(
    comicInfoXml?.number,
    comicBookInfoPayload?.issue?.toString(),
    coMet?.issue?.toString(),
  )

  const volumeNumber = firstDefinedString(
    comicInfoXml?.volume?.toString(),
    comicBookInfoPayload?.volume?.toString(),
    coMet?.volume?.toString(),
  )

  const count = firstDefinedNumber(
    comicInfoXml?.count,
    comicBookInfoPayload?.numberOfIssues,
  )

  // Date handling across sources:
  // - ComicInfo provides discrete year/month/day
  // - CoMet provides an ISO date (YYYY-MM-DD)
  // - ComicBookInfo provides publicationMonth / publicationYear
  let year = firstDefinedNumber(comicInfoXml?.year, comicBookInfoPayload?.publicationYear)
  let month = firstDefinedNumber(comicInfoXml?.month, comicBookInfoPayload?.publicationMonth)
  let day = firstDefinedNumber(comicInfoXml?.day)

  if (coMet?.date) {
    const dateMatch = coMet.date.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (dateMatch) {
      year = firstDefinedNumber(year, Number(dateMatch[1]))
      month = firstDefinedNumber(month, Number(dateMatch[2]))
      day = firstDefinedNumber(day, Number(dateMatch[3]))
    } else if (year === undefined) {
      const yearMatch = coMet.date.match(/\d{4}/)
      if (yearMatch) {
        year = Number(yearMatch[0])
      }
    }
  }

  const publicationDate = firstDefinedString(
    comicInfoXml?.year !== undefined || comicInfoXml?.month !== undefined
      ? [comicInfoXml?.year, comicInfoXml?.month, comicInfoXml?.day]
          .filter((v): v is number => v !== undefined)
          .map(v => v.toString().padStart(v > 999 ? 4 : 2, "0"))
          .join("-") || undefined
      : undefined,
    coMet?.date,
    comicBookInfoPayload?.publicationYear !== undefined
      ? String(comicBookInfoPayload.publicationYear)
      : undefined,
  )

  const genres = uniqueStrings([
    splitCsv(comicInfoXml?.genre),
    coMet?.genre,
    splitCsv(comicBookInfoPayload?.genre),
  ])

  const credits = gatherCredits(comicInfoXml, coMet, comicBookInfoPayload)

  return {
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
    issueNumber,
    count,
    volumeNumber,

    alternateSeries: firstDefinedString(comicInfoXml?.alternateSeries),
    alternateIssueNumber: firstDefinedString(comicInfoXml?.alternateNumber),
    alternateCount: firstDefinedNumber(comicInfoXml?.alternateCount),
    alternateVolumeNumber: undefined,

    pageCount: firstDefinedNumber(
      comicInfoXml?.pageCount,
      comicInfoXml?.pages?.length,
      coMet?.pages?.length,
    ),
    year,
    month,
    day,
    publicationDate,

    publisher: firstDefinedString(
      comicInfoXml?.publisher,
      comicBookInfoPayload?.publisher,
      coMet?.publisher,
    ),
    imprint: firstDefinedString(comicInfoXml?.imprint),
    summary: firstDefinedString(
      comicInfoXml?.summary,
      coMet?.description,
    ),
    notes: firstDefinedString(
      comicInfoXml?.notes,
      comicBookInfoPayload?.comments,
    ),
    language: firstDefinedString(
      comicInfoXml?.languageISO,
      comicBookInfoPayload?.language,
      coMet?.language,
    ),
    format: firstDefinedString(
      comicInfoXml?.format,
      coMet?.format,
    ),
    web: firstDefinedString(
      comicInfoXml?.web,
      coMet?.identifier,
      coMet?.isVersionOf,
    ),

    blackAndWhite: firstDefined(comicInfoXml?.blackAndWhite),
    manga: firstDefined(comicInfoXml?.manga),
    readingDirection: firstDefined(coMet?.readingDirection),

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
    scanInfo: firstDefinedString(comicInfoXml?.scanInformation),

    genres,
    storyArcs: uniqueStrings([splitCsv(comicInfoXml?.storyArc)]),
    seriesGroups: uniqueStrings([splitCsv(comicInfoXml?.seriesGroup)]),
    characters: uniqueStrings([
      splitCsv(comicInfoXml?.characters),
      coMet?.character,
    ]),
    teams: uniqueStrings([splitCsv(comicInfoXml?.teams)]),
    locations: uniqueStrings([splitCsv(comicInfoXml?.locations)]),
    credits,
    pages: gatherPages(comicInfoXml, coMet),
    tags: uniqueStrings([comicBookInfoPayload?.tags]),
  }
}

const uniqueStrings = (values: (string[] | undefined)[]): string[] => {
  const seen = new Set<string>()
  const result: string[] = []

  for (const group of values) {
    if (!group) {
      continue
    }
    for (const value of group) {
      const trimmed = value.trim()
      if (trimmed !== "" && !seen.has(trimmed)) {
        seen.add(trimmed)
        result.push(trimmed)
      }
    }
  }

  return result
}

const splitCsv = (value: string | undefined): string[] | undefined => {
  if (value === undefined || value.trim() === "") {
    return undefined
  }

  return value
    .split(",")
    .map(v => v.trim())
    .filter(v => v !== "")
}

const gatherCredits = (
  comicInfoXml: ComicInfo | undefined,
  coMet: CoMet | undefined,
  comicBookInfoPayload: ComicBookInfoPayload | undefined,
): ConsolidatedCredit[] => {
  const credits = new Map<string, ConsolidatedCredit>()

  const addPeople = (names: string[] | undefined, role: string) => {
    if (!names) {
      return
    }
    for (const name of names) {
      const trimmed = name.trim()
      if (trimmed === "") {
        continue
      }
      const key = `${trimmed.toLowerCase()}|${role.toLowerCase()}`
      if (!credits.has(key)) {
        credits.set(key, { person: trimmed, role })
      }
    }
  }

  // ComicInfo: comma-separated role groups
  addPeople(splitCsv(comicInfoXml?.writer), "Writer")
  addPeople(splitCsv(comicInfoXml?.penciler), "Penciler")
  addPeople(splitCsv(comicInfoXml?.inker), "Inker")
  addPeople(splitCsv(comicInfoXml?.colorist), "Colorist")
  addPeople(splitCsv(comicInfoXml?.letterer), "Letterer")
  addPeople(splitCsv(comicInfoXml?.coverArtist), "Cover Artist")
  addPeople(splitCsv(comicInfoXml?.editor), "Editor")

  // CoMet: arrays per role (creator is a generic fallback)
  addPeople(coMet?.writer, "Writer")
  addPeople(coMet?.penciler, "Penciler")
  addPeople(coMet?.inker, "Inker")
  addPeople(coMet?.colorist, "Colorist")
  addPeople(coMet?.letterer, "Letterer")
  addPeople(coMet?.coverDesigner, "Cover Designer")
  addPeople(coMet?.editor, "Editor")

  // ComicBookInfo: structured credits with role included
  if (comicBookInfoPayload?.credits) {
    for (const credit of comicBookInfoPayload.credits) {
      const person = credit.person.trim()
      if (person === "") {
        continue
      }
      const role = credit.role.trim()
      const key = `${person.toLowerCase()}|${role.toLowerCase()}`
      if (!credits.has(key)) {
        credits.set(key, { person, role })
      }
    }
  }

  // Generic creator fallback (only added if the person has no role yet)
  if (coMet?.creator) {
    for (const name of coMet.creator) {
      const trimmed = name.trim()
      if (trimmed === "") {
        continue
      }
      const hasAnyRole = [...credits.values()].some(
        c => c.person.toLowerCase() === trimmed.toLowerCase(),
      )
      if (!hasAnyRole) {
        credits.set(`${trimmed.toLowerCase()}|creator`, { person: trimmed, role: "Creator" })
      }
    }
  }

  return [...credits.values()]
}

const gatherPages = (
  comicInfoXml: ComicInfo | undefined,
  coMet: CoMet | undefined,
): ConsolidatedPageInfo[] => {
  if (comicInfoXml?.pages && comicInfoXml.pages.length > 0) {
    return comicInfoXml.pages.map(page => ({
      image: page.Image,
      type: page.Type,
      doublePage: page.DoublePage,
      imageSize: page.ImageSize,
      key: page.Key,
      bookmark: page.Bookmark,
      imageWidth: page.ImageWidth,
      imageHeight: page.ImageHeight,
    }))
  }

  if (coMet?.pages && coMet.pages.length > 0) {
    return coMet.pages.map((image, index) => ({
      image,
      type: index === 0 ? "FrontCover" : undefined,
    }))
  }

  return []
}
