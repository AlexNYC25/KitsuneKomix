import type {
  ComicInfo,
  CoMet,
  ComicBookInfoPayload,
} from "comic-metadata-tool"
import type {
  ConsolidatedCredit,
  ConsolidatedPageInfo,
} from "../../shared/types/utilities.types"

/**
 * Returns the first non-empty value from the given list, or undefined.
 * Used to resolve overlapping fields across metadata sources where each
 * source provides the same piece of information.
 */
export const firstDefined = <T>(
  ...values: (T | undefined)[]
): T | undefined => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") {
      return value
    }
  }
  return undefined
}

/**
 * Like `firstDefined` but for strings: trims the value and skips whitespace-only
 * strings so a blank value doesn't shadow a real one.
 */
export const firstDefinedString = (
  ...values: (string | undefined)[]
): string | undefined => {
  for (const value of values) {
    if (value !== undefined && value !== null && value.trim() !== "") {
      return value.trim()
    }
  }
  return undefined
}

/**
 * Like `firstDefined` but for numbers (skips null/undefined only).
 */
export const firstDefinedNumber = (
  ...values: (number | undefined)[]
): number | undefined => {
  for (const value of values) {
    if (value !== undefined && value !== null) {
      return value
    }
  }
  return undefined
}

/**
 * Splits a comma-separated string into a trimmed, non-empty array.
 * Returns undefined for empty input.
 */
export const splitCsv = (
  value: string | undefined,
): string[] | undefined => {
  if (value === undefined || value.trim() === "") {
    return undefined
  }

  return value
    .split(",")
    .map(v => v.trim())
    .filter(v => v !== "")
}

/**
 * Flattens any number of string collections into a single de-duplicated array.
 * Whitespace-only entries are dropped.
 */
export const uniqueStrings = (
  values: (string[] | undefined)[],
): string[] => {
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

/**
 * Collects every creator/credit from all metadata sources into one list,
 * de-duplicating the same person+role combination.
 *
 * - ComicInfo: comma-separated values per role
 * - CoMet: arrays per role
 * - ComicBookInfo: structured credits with a role per entry
 */
export const gatherCredits = (
  comicInfoXml?: ComicInfo,
  coMet?: CoMet,
  comicBookInfoPayload?: ComicBookInfoPayload,
): ConsolidatedCredit[] => {
  const credits = new Map<string, ConsolidatedCredit>()

  const addPeople = (names: string[] | undefined, role: string) => {
    if (!names) {
      return
    }
    for (const name of names) {
      const person = name.trim()
      if (person === "") {
        continue
      }
      const key = `${person.toLowerCase()}|${role.toLowerCase()}`
      if (!credits.has(key)) {
        credits.set(key, { person, role })
      }
    }
  }

  const addStructuredCredits = (entries?: { person: string; role: string }[]) => {
    if (!entries) {
      return
    }
    for (const entry of entries) {
      const person = entry.person.trim()
      if (person === "") {
        continue
      }
      const role = entry.role.trim()
      const key = `${person.toLowerCase()}|${role.toLowerCase()}`
      if (!credits.has(key)) {
        credits.set(key, { person, role })
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

  // CoMet: arrays per role
  addPeople(coMet?.writer, "Writer")
  addPeople(coMet?.penciler, "Penciler")
  addPeople(coMet?.inker, "Inker")
  addPeople(coMet?.colorist, "Colorist")
  addPeople(coMet?.letterer, "Letterer")
  addPeople(coMet?.coverDesigner, "Cover Designer")
  addPeople(coMet?.editor, "Editor")

  // ComicBookInfo: structured credits with role included
  addStructuredCredits(comicBookInfoPayload?.credits)

  // CoMet generic creator fallback (only when the person has no role yet)
  if (coMet?.creator) {
    for (const name of coMet.creator) {
      const person = name.trim()
      if (person === "") {
        continue
      }
      const hasAnyRole = [...credits.values()].some(
        c => c.person.toLowerCase() === person.toLowerCase(),
      )
      if (!hasAnyRole) {
        credits.set(`${person.toLowerCase()}|creator`, {
          person,
          role: "Creator",
        })
      }
    }
  }

  return [...credits.values()]
}

/**
 * Gathers page information, preferring ComicInfo's detailed pages and falling
 * back to CoMet's simpler page numbers (the first page is treated as a cover).
 */
export const gatherPages = (
  comicInfoXml?: ComicInfo,
  coMet?: CoMet,
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
