import { readComicFileMetadata, MetadataCompiled, ComicInfo, CoMet } from "comic-metadata-tool"
import { StandardizedComicMetadata } from "../interfaces/StandardizedComicMetadata.interface.ts";

/**
 * Uses the comic-metadata-tool to read metadata from a comic file.
 * @param filePath 
 * @returns A promise that resolves to the metadata object or null if an error occurs.
 * @throws Will log an error if metadata reading fails.
 */
export async function getMetadata(filePath: string) {
  try {
    const metadata = await readComicFileMetadata(filePath);
    return metadata;
  } catch (error) {
    console.error("Error fetching metadata for file", filePath, ":", error);
    return null;
  }
}

export async function standardizeMetadata(filePath: string): Promise<StandardizedComicMetadata | null> {
  const rawMetadata: MetadataCompiled | null = await getMetadata(filePath);

  if (!rawMetadata) {
    return null;
  }

  const comicInfoXml = rawMetadata?.comicInfoXml;
  const cometXml = rawMetadata?.coMet;

  if (comicInfoXml) {
    return standardizeFromComicInfo(comicInfoXml);
  } else if (cometXml) {
    return standardizeFromCoMet(cometXml);
  }

  return null;
};

function standardizeFromComicInfo(comicInfo: ComicInfo): StandardizedComicMetadata {
  // Helper function to safely split comma-separated strings
  const splitAndClean = (value: string | string[] | undefined): string[] | undefined => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value.filter(Boolean);
    return value.split(',').map((s: string) => s.trim()).filter(Boolean);
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
    pencillers: splitAndClean(comicInfo.penciller),
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
    communityRating: comicInfo.communityRating ? parseFloat(comicInfo.communityRating.toString()) : undefined,

    // Pages - convert ComicPageInfo to StandardizedComicMetadataPage
    pages: comicInfo.pages?.map(page => ({
      image: page.Image?.toString() || "",
      type: page.Type || "Story",
      doublePage: page.DoublePage,
      size: undefined, // Size not available in ComicPageInfo
      width: page.ImageWidth,
      height: page.ImageHeight,
    })),
  };
}

function standardizeFromCoMet(comet: CoMet): StandardizedComicMetadata {
  // Helper function to safely split comma-separated strings
  const splitAndClean = (value: string | string[] | undefined): string[] | undefined => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value.filter(Boolean);
    return value.split(',').map((s: string) => s.trim()).filter(Boolean);
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
    readingDirection: comet.readingDirection as StandardizedComicMetadata['readingDirection'],
    review: undefined,

    // People - Use basic fields available in CoMet
    writers: splitAndClean(comet.writer),
    pencillers: undefined, // Not available in CoMet
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
}