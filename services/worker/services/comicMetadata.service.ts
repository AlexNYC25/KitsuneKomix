import {
  updateComicBook,
  insertGenre,
  linkGenreToComicBook,
  insertPublisher,
  linkPublisherToComicBook,
  insertCredit,
  linkCreditToComicBook,
  insertContent,
  linkContentToComicBook,
  insertStoryArc,
  linkStoryArcToComicBook,
  insertSeriesGroup,
  linkSeriesGroupToComicBook,
  insertWebLink,
} from "kitsune-komix-database"

import { workerLogger } from "../loggers/index"

import type {
  NewComicBook,
} from "kitsune-komix-database"

import type {
  ComicMetadataInsertionResult,
  ConsolidatedComicMetadata,
} from "../shared/types/utilities.types"

/**
 * Coerces a boolean or a "Yes"/"No"/"Unknown" style string into a boolean for
 * the boolean-typed comic book columns. Values that cannot be resolved to a
 * boolean ("Unknown", booleans are passed through) resolve to undefined so the
 * column keeps its database default.
 */
const toBoolean = (
  value: boolean | string | undefined,
): boolean | undefined => {
  if (value === undefined || typeof value === "boolean") {
    return value
  }

  const normalized = value.trim().toLowerCase()

  if (normalized === "yes" || normalized === "yesandrighttoleft") {
    return true
  }

  if (normalized === "no") {
    return false
  }

  return undefined
}

/**
 * Records a comic book's consolidated metadata into the database: updates the
 * comic book's scalar fields and inserts/links every entity produced by the
 * metadata consolidation (genres, publishers, credits, content, story arcs,
 * series groups, web links).
 * @param comicBookId The ID of the comic book the metadata belongs to
 * @param metadata The consolidated metadata to record
 * @returns A summary of the entities recorded per type
 */
export const insertComicBookMetadata = async (
  comicBookId: number,
  metadata: ConsolidatedComicMetadata,
): Promise<ComicMetadataInsertionResult> => {
  const result: ComicMetadataInsertionResult = {
    genres: 0,
    publishers: 0,
    imprints: 0,
    credits: 0,
    characters: 0,
    teams: 0,
    locations: 0,
    storyArcs: 0,
    seriesGroups: 0,
    webLinks: 0,
  }

  await updateComicBookScalarFields(comicBookId, metadata)

  if (metadata.genres.length > 0) {
    for (const genre of metadata.genres) {
      const genreId = await insertGenre(genre)
      await linkGenreToComicBook(genreId, comicBookId)
      result.genres += 1
    }
  }

  if (metadata.publisher) {
    const publisherId = await insertPublisher(metadata.publisher, false)
    await linkPublisherToComicBook(publisherId, comicBookId)
    result.publishers += 1
  }

  if (metadata.imprint) {
    const imprintId = await insertPublisher(metadata.imprint, true)
    await linkPublisherToComicBook(imprintId, comicBookId)
    result.imprints += 1
  }

  if (metadata.credits.length > 0) {
    for (const credit of metadata.credits) {
      const creditId = await insertCredit(credit.person, credit.role)
      await linkCreditToComicBook(creditId, comicBookId)
      result.credits += 1
    }
  }

  if (metadata.characters.length > 0) {
    for (const character of metadata.characters) {
      const contentId = await insertContent(character, "character")
      await linkContentToComicBook(contentId, comicBookId)
      result.characters += 1
    }
  }

  if (metadata.teams.length > 0) {
    for (const team of metadata.teams) {
      const contentId = await insertContent(team, "team")
      await linkContentToComicBook(contentId, comicBookId)
      result.teams += 1
    }
  }

  if (metadata.locations.length > 0) {
    for (const location of metadata.locations) {
      const contentId = await insertContent(location, "location")
      await linkContentToComicBook(contentId, comicBookId)
      result.locations += 1
    }
  }

  if (metadata.storyArcs.length > 0) {
    for (let position = 0; position < metadata.storyArcs.length; position++) {
      const storyArc = metadata.storyArcs[position]

      if (storyArc === undefined) {
        continue
      }

      const storyArcId = await insertStoryArc(storyArc)
      await linkStoryArcToComicBook(storyArcId, comicBookId, position)
      result.storyArcs += 1
    }
  }

  if (metadata.seriesGroups.length > 0) {
    for (let position = 0; position < metadata.seriesGroups.length; position++) {
      const seriesGroup = metadata.seriesGroups[position]

      if (seriesGroup === undefined) {
        continue
      }

      const seriesGroupId = await insertSeriesGroup(seriesGroup)
      await linkSeriesGroupToComicBook(seriesGroupId, comicBookId, position)
      result.seriesGroups += 1
    }
  }

  if (metadata.web) {
    await insertWebLink(metadata.web, comicBookId)
    result.webLinks += 1
  }

  return result
}

/**
 * Updates the comic book's scalar metadata fields, skipping any that are
 * undefined.
 * @param comicBookId The ID of the comic book to update
 * @param metadata The consolidated metadata to apply
 */
const updateComicBookScalarFields = async (
  comicBookId: number,
  metadata: ConsolidatedComicMetadata,
): Promise<void> => {
  const updates: Partial<NewComicBook> = {}

  const blackAndWhite = toBoolean(metadata.blackAndWhite)
  const manga = toBoolean(metadata.manga)

  if (metadata.title !== undefined) updates.title = metadata.title
  if (metadata.series !== undefined) updates.series = metadata.series
  if (metadata.issueNumber !== undefined) updates.issueNumber = metadata.issueNumber
  if (metadata.count !== undefined) updates.count = metadata.count
  if (metadata.volumeNumber !== undefined) updates.volumeNumber = metadata.volumeNumber
  if (metadata.alternateSeries !== undefined) updates.alternateSeries = metadata.alternateSeries
  if (metadata.alternateIssueNumber !== undefined) updates.alternateIssueNumber = metadata.alternateIssueNumber
  if (metadata.alternateCount !== undefined) updates.alternateCount = metadata.alternateCount
  if (metadata.alternateVolumeNumber !== undefined) updates.alternateVolumeNumber = metadata.alternateVolumeNumber
  if (metadata.pageCount !== undefined) updates.pageCount = metadata.pageCount
  if (metadata.year !== undefined) updates.year = metadata.year
  if (metadata.month !== undefined) updates.month = metadata.month
  if (metadata.day !== undefined) updates.day = metadata.day
  if (metadata.publicationDate !== undefined) updates.publicationDate = metadata.publicationDate
  if (metadata.publisher !== undefined) updates.publisher = metadata.publisher
  if (metadata.summary !== undefined) updates.summary = metadata.summary
  if (metadata.notes !== undefined) updates.notes = metadata.notes
  if (metadata.language !== undefined) updates.language = metadata.language
  if (metadata.format !== undefined) updates.format = metadata.format
  if (metadata.scanInfo !== undefined) updates.scanInfo = metadata.scanInfo
  if (metadata.ageRating !== undefined) updates.ageRating = metadata.ageRating
  if (metadata.communityRating !== undefined) updates.communityRating = metadata.communityRating
  if (metadata.review !== undefined) updates.review = metadata.review
  if (metadata.readingDirection !== undefined) updates.readingDirection = metadata.readingDirection
  if (blackAndWhite !== undefined) updates.blackAndWhite = blackAndWhite
  if (manga !== undefined) updates.manga = manga

  if (Object.keys(updates).length === 0) {
    return
  }

  const updated = await updateComicBook(comicBookId, updates)

  if (!updated) {
    workerLogger.warn(
      `updateComicBook did not update a record for comic book ${comicBookId}: record may not exist.`,
    )
  }
}