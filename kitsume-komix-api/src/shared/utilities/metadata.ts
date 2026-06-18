import { apiLogger } from "#logger/loggers.ts";
import {
  type CoMet,
  type ComicInfo,
  type MetadataCompiled,
  readComicFileMetadata,
} from "comic-metadata-tool";

import { getFileSize } from "#utilities/file.ts";

import { getLibraryContainingPath } from "#infrastructure/db/sqlite/models/comicLibraries.model.ts";

import type { StandardizedComicMetadata } from "#types/index.ts";
import type { ComicFileDetails, NewComicBook, NewComicMetadataCandidate, } from "#types/index.ts";

import { env } from "#config/env.ts";

const metadataCache = new Map<
  string,
  { value: StandardizedComicMetadata; expiresAt: number }
>();

/**
 * Uses the comic-metadata-tool to read metadata from a comic file.
 * @param filePath
 * @returns A promise that resolves to the metadata object or null if an error occurs.
 * @throws Will log an error if metadata reading fails.
 */
const getMetadata = async (filePath: string) => {
  try {
    const metadata = await readComicFileMetadata(filePath);
    return metadata;
  } catch (error) {
    apiLogger.error("Error fetching metadata for file " + filePath + ":" + error);
    return null;
  }
};

/**
 * Standardizes comic metadata from various formats into a unified structure.
 * @param filePath Path to the comic file.
 * @returns Standardized metadata object or null if extraction fails.
 */
export const standardizeMetadata = async (
  filePath: string,
): Promise<StandardizedComicMetadata | undefined> => {
  const rawMetadata: MetadataCompiled | null = await getMetadata(filePath);

  if (!rawMetadata) {
    return undefined;
  }

  const comicInfoXml = rawMetadata?.comicInfoXml;
  const cometXml = rawMetadata?.coMet;

  if (comicInfoXml) {
    return standardizeFromComicInfo(comicInfoXml);
  } else if (cometXml) {
    return standardizeFromCoMet(cometXml);
  }

  return undefined;
};

/**
 * Converts ComicInfo XML metadata to standardized format.
 * @param comicInfo ComicInfo metadata object.
 * @returns Standardized metadata object.
 */
const standardizeFromComicInfo = (
  comicInfo: ComicInfo,
): StandardizedComicMetadata => {
  // Helper function to safely split comma-separated strings
  const splitAndClean = (
    value: string | string[] | undefined,
  ): string[] | undefined => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value.filter(Boolean);
    return value.split(",").map((s: string) => s.trim()).filter(Boolean);
  };

  // Helper to convert YesNo to boolean
  const yesNoToBoolean = (value: string | undefined): boolean | undefined => {
    if (value === "Yes") return true;
    if (value === "No") return false;
    return undefined;
  };

  return {
    title: comicInfo.title,
    series: comicInfo.series || "Unknown Series",
    issueNumber: comicInfo.number?.toString() || "1",
    volume: comicInfo.volume?.toString(),
    count: comicInfo.count,
    alternateSeries: comicInfo.alternateSeries,
    alternateNumber: comicInfo.alternateNumber?.toString(),
    alternateCount: comicInfo.alternateCount,
    pageCount: comicInfo.pageCount || 0,
    summary: comicInfo.summary,
    notes: comicInfo.notes,
    year: comicInfo.year,
    month: comicInfo.month,
    day: comicInfo.day,
    scanInfo: comicInfo.scanInformation,
    language: comicInfo.languageISO,
    format: comicInfo.format,
    blackAndWhite: yesNoToBoolean(comicInfo.blackAndWhite),
    manga: yesNoToBoolean(comicInfo.manga),
    readingDirection: undefined, // ComicInfo doesn't have this field
    review: comicInfo.review,

    // People - handle both string and array formats
    writers: splitAndClean(comicInfo.writer),
    pencilers: splitAndClean(comicInfo.penciler),
    inkers: splitAndClean(comicInfo.inker),
    colorists: splitAndClean(comicInfo.colorist),
    letterers: splitAndClean(comicInfo.letterer),
    editors: splitAndClean(comicInfo.editor),
    coverArtists: splitAndClean(comicInfo.coverArtist),

    // Publishers and other data
    publisher: comicInfo.publisher ? [comicInfo.publisher] : undefined,
    imprint: comicInfo.imprint ? [comicInfo.imprint] : undefined,
    genres: splitAndClean(comicInfo.genre),
    web: comicInfo.web ? [comicInfo.web] : undefined,
    characters: splitAndClean(comicInfo.characters),
    teams: splitAndClean(comicInfo.teams),
    mainCharacterTeam: comicInfo.mainCharacterOrTeam,
    locations: splitAndClean(comicInfo.locations),
    storyArcs: splitAndClean(comicInfo.storyArc),
    seriesGroups: splitAndClean(comicInfo.seriesGroup),

    // Ratings
    ageRating: comicInfo.ageRating,
    communityRating: comicInfo.communityRating
      ? parseFloat(comicInfo.communityRating.toString())
      : undefined,

    // Pages - convert ComicPageInfo to StandardizedComicMetadataPage
    pages: comicInfo.pages?.map((page) => ({
      image: page.Image?.toString() || "",
      type: page.Type || "Story",
      doublePage: page.DoublePage,
      size: undefined, // Size not available in ComicPageInfo
      width: page.ImageWidth,
      height: page.ImageHeight,
    })),
  };
};

/**
 * Converts CoMet XML metadata to standardized format.
 * @param comet CoMet metadata object.
 * @returns Standardized metadata object.
 */
const standardizeFromCoMet = (comet: CoMet): StandardizedComicMetadata => {
  // Helper function to safely split comma-separated strings
  const splitAndClean = (
    value: string | string[] | undefined,
  ): string[] | undefined => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value.filter(Boolean);
    return value.split(",").map((s: string) => s.trim()).filter(Boolean);
  };

  return {
    title: comet.title || "Unknown Title",
    series: comet.series || "Unknown Series",
    issueNumber: comet.issue?.toString() || "1",
    volume: comet.volume?.toString(),
    count: 1, // CoMet doesn't have issueCount
    alternateSeries: undefined,
    alternateNumber: undefined,
    alternateCount: undefined,
    pageCount: 0,
    summary: comet.description,
    notes: undefined,
    year: comet.date ? new Date(comet.date).getFullYear() : undefined,
    month: comet.date ? new Date(comet.date).getMonth() + 1 : undefined,
    day: comet.date ? new Date(comet.date).getDate() : undefined,
    scanInfo: undefined,
    language: comet.language,
    format: comet.format,
    blackAndWhite: undefined,
    manga: undefined,
    readingDirection: comet
      .readingDirection as StandardizedComicMetadata["readingDirection"],
    review: undefined,

    // People - Use basic fields available in CoMet
    writers: splitAndClean(comet.writer),
    pencilers: undefined, // Not available in CoMet
    inkers: undefined,
    colorists: undefined,
    letterers: undefined,
    editors: undefined,
    coverArtists: undefined,

    // Publishers and other data
    publisher: comet.publisher ? [comet.publisher] : undefined,
    imprint: undefined,
    genres: splitAndClean(comet.genre),
    web: comet.identifier ? [comet.identifier] : undefined,
    characters: splitAndClean(comet.character),
    teams: undefined,
    mainCharacterTeam: undefined,
    locations: undefined,
    storyArcs: undefined,
    seriesGroups: undefined,

    // Ratings
    ageRating: comet.rating,
    communityRating: undefined,

    // Pages
    pages: undefined,
  };
};

/**
 * Combines metadata from various sources with parsed file details to create a new comic book entry.
 * @param workerData Data from the worker for building the comic insertion.
 * @param fileDetails Parsed details from the comic file.
 * @param fileMetadata Optional standardized metadata.
 * @returns A new comic book object ready for insertion.
 */
export const combineMetadataWithParsedFileDetails = (
  fileDetails: ComicFileDetails,
  fileMetadata?: StandardizedComicMetadata,
): Partial<NewComicBook> => {

  const comicData: Partial<NewComicBook> = {
    title: fileMetadata?.title || null,
    series: fileMetadata?.series || fileDetails.series || null,
    issueNumber: fileMetadata?.issueNumber || fileDetails.issue ||
      null,
    count: fileMetadata?.count || null,
    volume: fileMetadata?.volume || fileDetails.volume || null,
    alternateSeries: fileMetadata?.alternateSeries || null,
    alternateIssueNumber: fileMetadata?.alternateNumber || null,
    alternateCount: fileMetadata?.alternateCount || null,
    pageCount: fileMetadata?.pageCount || null,
    summary: fileMetadata?.summary || null,
    notes: fileMetadata?.notes || null,
    year: fileMetadata?.year || Number(fileDetails.year) || null,
    month: fileMetadata?.month || null,
    day: fileMetadata?.day || null,
    publisher: fileMetadata?.publisher?.[0] || null,
    publicationDate: fileMetadata?.year
      ? `${fileMetadata.year}-${
        String(fileMetadata.month || 1).padStart(2, "0")
      }-${String(fileMetadata.day || 1).padStart(2, "0")}`
      : null,
    scanInfo: fileMetadata?.scanInfo || null,
    language: fileMetadata?.language || null,
    format: fileMetadata?.format || null,
    blackAndWhite: fileMetadata?.blackAndWhite ? 1 : 0,
    manga: fileMetadata?.manga ? 1 : 0,
    readingDirection: fileMetadata?.readingDirection || null,
    review: fileMetadata?.review || null,
    ageRating: fileMetadata?.ageRating || null,
    communityRating: fileMetadata?.communityRating || null,
  };

  return comicData;
}

/**
 * Stores standardized comic metadata in an in-process cache with a 1-hour TTL.
 */
export const loadMetadataIntoCache = async (
  filePath: string,
  metadata: StandardizedComicMetadata,
): Promise<void> => {
  metadataCache.set(filePath, {
    value: metadata,
    expiresAt: Date.now() + env.METADATA_CACHE_TTL_MS,
  });
};

/**
 * Retrieves cached comic metadata.
 */
export const retrieveMetadataFromCache = async (
  filePath: string,
): Promise<StandardizedComicMetadata | null> => {
  const entry = metadataCache.get(filePath);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    metadataCache.delete(filePath);
    return null;
  }

  return entry.value;
};

/**
 * Removes metadata from cache for a given file path.
 */
export const removeMetadataFromCache = async (
  filePath: string,
): Promise<boolean> => {
  return metadataCache.delete(filePath);
};

/**
 * Converts a standardized metadata object into an array of metadata candidates for database insertion.
 * @param metadata The standardized metadata to convert into candidates.
 * @param comicBookId The ID of the comic book these candidates are associated with.
 * @returns An array of metadata candidates ready for insertion into the database.
 */
export const convertStandardizedMetadataToCandidates = (
  metadata: StandardizedComicMetadata,
  comicBookId: number
): NewComicMetadataCandidate[] => {

  const candidates: NewComicMetadataCandidate[] = [];

  if (metadata.series) {
    candidates.push({
      comicBookId,
      type: "series",
      value: metadata.series,
      normalizedValue: metadata.series.toLowerCase().trim(),
    });
  }

  if (metadata.genres) {
    for (const genre of metadata.genres) {
      candidates.push({
        comicBookId,
        type: "genre",
        value: genre,
        normalizedValue: genre.toLowerCase().trim(),
      });
    }
  }

  if (metadata.publisher) {
    for (const publisher of metadata.publisher) {
      candidates.push({
        comicBookId,
        type: "publisher",
        value: publisher,
        normalizedValue: publisher.toLowerCase().trim(),
      });
    }
  }

  if (metadata.imprint) {
    for (const imprint of metadata.imprint) {
      candidates.push({
        comicBookId,
        type: "imprint",
        value: imprint,
        normalizedValue: imprint.toLowerCase().trim(),
      });
    }
  }

  if (metadata.writers) {
    for (const writer of metadata.writers) {
      candidates.push({
        comicBookId,
        type: "writer",
        value: writer,
        normalizedValue: writer.toLowerCase().trim(),
      });
    }
  }

  if (metadata.pencilers) {
    for (const penciler of metadata.pencilers) {
      candidates.push({
        comicBookId,
        type: "penciler",
        value: penciler,
        normalizedValue: penciler.toLowerCase().trim(),
      });
    }
  }

  if (metadata.inkers) {
    for (const inker of metadata.inkers) {
      candidates.push({
        comicBookId,
        type: "inker",
        value: inker,
        normalizedValue: inker.toLowerCase().trim(),
      });
    }
  }

  if (metadata.colorists) {
    for (const colorist of metadata.colorists) {
      candidates.push({
        comicBookId,
        type: "colorist",
        value: colorist,
        normalizedValue: colorist.toLowerCase().trim(),
      });
    }
  }

  if (metadata.letterers) {
    for (const letterer of metadata.letterers) {
      candidates.push({
        comicBookId,
        type: "letterer",
        value: letterer,
        normalizedValue: letterer.toLowerCase().trim(),
      });
    }
  }

  if (metadata.editors) {
    for (const editor of metadata.editors) {
      candidates.push({
        comicBookId,
        type: "editor",
        value: editor,
        normalizedValue: editor.toLowerCase().trim(),
      });
    }
  }
  
  if (metadata.coverArtists) {
    for (const coverArtist of metadata.coverArtists) {
      candidates.push({
        comicBookId,
        type: "cover_artist",
        value: coverArtist,
        normalizedValue: coverArtist.toLowerCase().trim(),
      });
    }
  }

  if (metadata.characters) {
    for (const character of metadata.characters) {
      candidates.push({
        comicBookId,
        type: "character",
        value: character,
        normalizedValue: character.toLowerCase().trim(),
      });
    }
  }

  if (metadata.teams) {
    for (const team of metadata.teams) {
      candidates.push({
        comicBookId,
        type: "team",
        value: team,
        normalizedValue: team.toLowerCase().trim(),
      });
    }
  }

  if (metadata.locations) {
    for (const location of metadata.locations) {
      candidates.push({
        comicBookId,
        type: "location",
        value: location,
        normalizedValue: location.toLowerCase().trim(),
      });
    }
  }

  if (metadata.storyArcs) {
    for (const storyArc of metadata.storyArcs) {
      candidates.push({
        comicBookId,
        type: "story_arc",
        value: storyArc,
        normalizedValue: storyArc.toLowerCase().trim(),
      });
    }
  }

  if (metadata.seriesGroups) {
    for (const seriesGroup of metadata.seriesGroups) {
      candidates.push({
        comicBookId,
        type: "series_group",
        value: seriesGroup,
        normalizedValue: seriesGroup.toLowerCase().trim(),
      });
    }
  }

  return candidates;
}