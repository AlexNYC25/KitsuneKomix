import logger from "../../utilities/logger.ts";
import type { ComicInfo } from "npm:comic-metadata-tool/dist/src/interfaces/comicInfo.d.ts";

import { ComicFileProperties } from "../../interfaces/comic-file-properties.interface.ts";
import { ComicFolderProperties } from "../../interfaces/comic-folder-properties.interface.ts";
import { ComicSeriesInsert } from "../../interfaces/comic-series.interface.ts";

import { insertComicSeriesQuery } from "../../database/queries/comicSeries.ts";

/**
 * Parses and loads comic series metadata from the ComicInfo XML metadata with other parsed details and inserts it into the database.
 * @param metadata - The ComicInfo metadata object parsed from the XML file.
 * @param parentDir - The parent directory path where the series is located.
 * @param parsedComicDetails - The parsed comic file properties.
 * @param parsedFolderDetails - The parsed folder properties.
 * @returns The ID of the inserted comic series or null if insertion failed.
 */
export const parseAndLoadComicSeriesFromComicInfoXmlMetadata = (
  metadata: ComicInfo,
  parentDir: string,
  parsedComicDetails: ComicFileProperties,
  parsedFolderDetails: ComicFolderProperties,
): number | null => {
  if (!metadata) {
    logger.error('ComicsParser... No metadata or comicInfoXml found');
    return null;
  }

  let seriesId = null;
  const seriesPayload: ComicSeriesInsert = {
    name: metadata.Series || parsedComicDetails.seriesName || parsedComicDetails.seriesName,
    folder_path: parentDir,
    description: metadata.Summary || null,
    publisher: metadata.Publisher || null,
    start_year: parseInt(
      String(metadata.Year || parsedComicDetails.year || parsedFolderDetails.seriesYear || 0),
      10
    ),
    end_year: null,
    total_issues: metadata.Count || null
  };

  try {
    seriesId = insertComicSeriesQuery(seriesPayload);
    logger.info(`ComicsParser... Inserting series metadata for ${seriesPayload.name}`);
  } catch (error) {
    logger.error(`ComicsParser... Error inserting series metadata for ${seriesPayload.name}: ${error}`);
  }

  if (!seriesId) {
    logger.error(`ComicsParser... Failed to insert or upsert comic series for ${seriesPayload.name}`);
    return null;
  }

  return seriesId;
}

/**
 * Parses and loads comic series metadata from the comic file name with other parsed details and inserts it into the database.
 * @param parentDir - The parent directory path where the series is located.
 * @param parsedComicDetails - The parsed comic file properties.
 * @param parsedFolderDetails - The parsed folder properties.
 * @returns The ID of the inserted comic series or null if insertion failed.
 */
export const parseAndLoadComicSeriesFromFileName = (
  parentDir: string,
  parsedComicDetails: ComicFileProperties,
  parsedFolderDetails: ComicFolderProperties,
): number | null => {
  let seriesId = null;
  const seriesPayload: ComicSeriesInsert = {
    id: null, // This will be set after inserting the series
    name: parsedComicDetails.seriesName || parsedFolderDetails.seriesName,
    folder_path: parentDir,
    description: null,
    publisher: null,
    start_year: parseInt(
      String(parsedComicDetails.year || parsedFolderDetails.seriesYear || 0),
      10
    ),
    end_year: null,
    total_issues: null
  };

  try {
    seriesId = insertComicSeriesQuery(seriesPayload);
    logger.info(`ComicsParser... Inserting series metadata for ${seriesPayload.name}`);
  } catch (error) {
    logger.error(`ComicsParser... Error inserting series metadata for ${seriesPayload.name}: ${error}`);
  }

  if (!seriesId) {
    logger.error(`ComicsParser... Failed to insert or upsert comic series for ${seriesPayload.name}`);
    return null;
  }

  return seriesId;
}