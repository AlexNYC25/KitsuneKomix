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
  ComicMetadataInsertionResult,
  ConsolidatedComicMetadata,
} from "../shared/types/utilities.types"

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
  // TODO: Implement the metadata insertion flow

  return {
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
}