import {
  insertGenre,
  linkGenreToSeries,
  insertPublisher,
  linkPublisherToSeries,
  insertCredit,
  linkCreditToSeries,
  insertContent,
  linkContentToSeries,
  insertStoryArc,
  linkStoryArcToSeries,
  insertSeriesGroup,
  linkSeriesGroupToSeries,
} from "kitsune-komix-database"

import type {
  SeriesAggregationResult,
  ConsolidatedComicMetadata,
} from "../shared/types/utilities.types"

/**
 * Aggregates a comic book's consolidated metadata into its comic series by
 * recording the entities it contributes (genres, publishers, imprints, credits,
 * content, story arcs, series groups) in the series-level aggregate tables.
 * @param seriesId The ID of the comic series the metadata belongs to
 * @param metadata The consolidated metadata to aggregate into the series
 * @returns A summary of the entities aggregated per type
 */
export const aggregateComicBookMetadataIntoSeries = async (
  seriesId: number,
  metadata: ConsolidatedComicMetadata,
): Promise<SeriesAggregationResult> => {
  const result: SeriesAggregationResult = {
    genres: 0,
    publishers: 0,
    imprints: 0,
    credits: 0,
    characters: 0,
    teams: 0,
    locations: 0,
    storyArcs: 0,
    seriesGroups: 0,
  }

  if (metadata.genres.length > 0) {
    for (const genre of metadata.genres) {
      const genreId = await insertGenre(genre)
      await linkGenreToSeries(genreId, seriesId)
      result.genres += 1
    }
  }

  if (metadata.publisher) {
    const publisherId = await insertPublisher(metadata.publisher, false)
    await linkPublisherToSeries(publisherId, seriesId)
    result.publishers += 1
  }

  if (metadata.imprint) {
    const imprintId = await insertPublisher(metadata.imprint, true)
    await linkPublisherToSeries(imprintId, seriesId)
    result.imprints += 1
  }

  if (metadata.credits.length > 0) {
    for (const credit of metadata.credits) {
      const creditId = await insertCredit(credit.person, credit.role)
      await linkCreditToSeries(creditId, seriesId)
      result.credits += 1
    }
  }

  if (metadata.characters.length > 0) {
    for (const character of metadata.characters) {
      const contentId = await insertContent(character, "character")
      await linkContentToSeries(contentId, seriesId)
      result.characters += 1
    }
  }

  if (metadata.teams.length > 0) {
    for (const team of metadata.teams) {
      const contentId = await insertContent(team, "team")
      await linkContentToSeries(contentId, seriesId)
      result.teams += 1
    }
  }

  if (metadata.locations.length > 0) {
    for (const location of metadata.locations) {
      const contentId = await insertContent(location, "location")
      await linkContentToSeries(contentId, seriesId)
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
      await linkStoryArcToSeries(storyArcId, seriesId, position)
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
      await linkSeriesGroupToSeries(seriesGroupId, seriesId, position)
      result.seriesGroups += 1
    }
  }

  return result
}