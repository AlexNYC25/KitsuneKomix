import {
  insertGenre,
  linkGenreToSeries,
  insertPublisher,
  linkPublisherToSeries,
  insertSeriesGroup,
  linkSeriesGroupToSeries,
} from "kitsune-komix-database"

import type {
  SeriesAggregationResult,
  ConsolidatedComicMetadata,
} from "../shared/types/utilities.types"

/**
 * Aggregates a comic book's consolidated metadata into its comic series by
 * recording the entities it contributes (genres, publishers, imprints, series
 * groups) in the series-level aggregate tables.
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