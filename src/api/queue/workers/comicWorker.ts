// ==================================================================================
// COMIC WORKER - Processes comic book files and related metadata
// ==================================================================================

// Standard library imports
import { MetadataCompiled } from "npm:comic-metadata-tool";
import { Worker } from "bullmq";
import { dirname } from "@std/path";

// Utility imports
import { deleteFolderRecursive } from "../../utilities/file.ts";
import { getMetadata, standardizeMetadata } from "../../utilities/metadata.ts";
import { calculateFileHash } from "../../utilities/hash.ts";
import { extractComicBook } from "../../utilities/extract.ts";

// Queue and configuration imports
import { appQueue } from "../queueManager.ts";
import { redisConnection } from "../../db/redis/redisConnection.ts";
import { apiLogger, queueLogger } from "../../config/logger/loggers.ts";

// Interface imports
import { ComicMetadata } from "../../interfaces/ComicMetadata.interface.ts";

// Database model imports - Core models
import { insertComicBook } from "../../db/sqlite/models/comicBooks.model.ts"; 
import { insertComicSeries, getComicSeriesByPath } from "../../db/sqlite/models/comicSeries.model.ts";
import { getLibraryContainingPath } from "../../db/sqlite/models/comicLibraries.model.ts";
import { insertComicPage } from "../../db/sqlite/models/comicPages.model.ts";
import { insertComicBookCover } from "../../db/sqlite/models/comicBookCovers.model.ts";

// Database model imports - People/Creators
import { insertComicWriter, linkWriterToComicBook } from "../../db/sqlite/models/comicWriters.model.ts";
import { insertComicPenciller, linkPencillerToComicBook } from "../../db/sqlite/models/comicPenceillers.model.ts";
import { insertComicInker, linkInkerToComicBook } from "../../db/sqlite/models/comicInkers.model.ts";
import { insertComicColorist, linkColoristToComicBook } from "../../db/sqlite/models/comicColorists.model.ts";
import { insertComicLetterer, linkLettererToComicBook } from "../../db/sqlite/models/comicLetterers.model.ts";
import { insertComicEditor, linkEditorToComicBook } from "../../db/sqlite/models/comicEditors.model.ts";
import { insertComicCoverArtist, linkCoverArtistToComicBook } from "../../db/sqlite/models/comicCoverArtists.model.ts";

// Database model imports - Publishers/Content
import { insertComicPublisher, linkPublisherToComicBook } from "../../db/sqlite/models/comicPublishers.model.ts";
import { insertComicImprint, linkImprintToComicBook } from "../../db/sqlite/models/comicImprints.model.ts";
import { insertComicGenre, linkGenreToComicBook } from "../../db/sqlite/models/comicGenres.model.ts";
import { insertComicCharacter, linkCharacterToComicBook } from "../../db/sqlite/models/comicCharacters.model.ts";
import { insertComicTeam, linkTeamToComicBook } from "../../db/sqlite/models/comicTeams.model.ts";
import { insertComicLocation, linkLocationToComicBook } from "../../db/sqlite/models/comicLocations.model.ts";
import { insertComicStoryArc, linkStoryArcToComicBook } from "../../db/sqlite/models/comicStoryArcs.model.ts";
import { insertComicSeriesGroup, linkSeriesGroupToComicBook } from "../../db/sqlite/models/comicSeriesGroups.model.ts";

// ==================================================================================
// MAIN PROCESSING FUNCTIONS
// ==================================================================================

/**
 * Main comic file processing function
 * Handles metadata extraction, hash calculation, and initiates all follow-up jobs
 */
async function processNewComicFile(job: { data: { filePath: string; metadata: object } }): Promise<void> {
  queueLogger.info(`Processing new comic file: ${job.data.filePath}`);
  
  try {
    // ============== METADATA AND LIBRARY PROCESSING ==============
    const metadata: MetadataCompiled | null = await getMetadata(job.data.filePath);
    const libraryId: number | null = await findLibraryIdFromPath(job.data.filePath);

    if (!libraryId) {
      throw new Error(`Could not determine library ID for file path: ${job.data.filePath}`);
    }
    
    const standardizedMetadata = await standardizeMetadata(job.data.filePath);
    const fileHash = await calculateFileHash(job.data.filePath);

    // ============== COMIC BOOK DATA PREPARATION ==============
    const comicData = {
      library_id: libraryId,
      file_path: job.data.filePath,
      hash: fileHash,
      title: standardizedMetadata?.title || null,
      series: standardizedMetadata?.series || null,
      issue_number: standardizedMetadata?.issueNumber || null,
      count: standardizedMetadata?.count || null,
      volume: standardizedMetadata?.volume || null,
      alternate_series: standardizedMetadata?.alternateSeries || null,
      alternate_issue_number: standardizedMetadata?.alternateNumber || null,
      alternate_count: standardizedMetadata?.alternateCount || null,
      page_count: standardizedMetadata?.pageCount || null,
      summary: standardizedMetadata?.summary || null,
      notes: standardizedMetadata?.notes || null,
      year: standardizedMetadata?.year || null,
      month: standardizedMetadata?.month || null,
      day: standardizedMetadata?.day || null,
      publisher: standardizedMetadata?.publisher?.[0] || null,
      publication_date: standardizedMetadata?.year ? `${standardizedMetadata.year}` : null,
      scan_info: standardizedMetadata?.scanInfo || null,
      language: standardizedMetadata?.language || null,
      format: standardizedMetadata?.format || null,
      black_and_white: standardizedMetadata?.blackAndWhite ? 1 : 0,
      manga: standardizedMetadata?.manga ? 1 : 0,
      reading_direction: standardizedMetadata?.readingDirection || null,
      review: standardizedMetadata?.review || null,
      age_rating: standardizedMetadata?.ageRating || null,
      community_rating: standardizedMetadata?.communityRating || null,
    };

    // ============== INSERT COMIC BOOK RECORD ==============
    const comicId = await insertComicBook(comicData);
    apiLogger.info(`Inserted new comic book with ID: ${comicId}`);

    // ============== QUEUE FOLLOW-UP JOBS ==============
    
    // Queue image processing
    await queueImageProcessing(comicId, job.data.filePath);
    
    // Queue web link processing if available
    await queueWebLinkProcessing(comicId, standardizedMetadata?.web);
    
    // Queue series processing if needed
    const comicMetadata: ComicMetadata | null = metadata ? {
      comicInfoXml: metadata.comicInfoXml,
      filePath: job.data.filePath,
      ...metadata
    } : null;
    await queueSeriesProcessing(comicId, job.data.filePath, comicMetadata);
    
    // Queue creator processing
    await queueCreatorProcessing(comicId, standardizedMetadata);
    
    // Queue publisher/content processing
    await queuePublisherContentProcessing(comicId, standardizedMetadata);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(`Error processing comic file ${job.data.filePath}: ${errorMessage}`);
    throw error;
  }
}

/**
 * Processes comic file images - extracts, hashes, and stores page/cover data
 */
async function processComicFileImages(job: { data: { filePath: string; comicId: number } }): Promise<void> {
  try {
    queueLogger.info(`Processing comic file images for file: ${job.data.filePath} and comic ID: ${job.data.comicId}`);
    
    // ============== EXTRACT COMIC IMAGES ==============
    const extractionResult = await extractComicBook(job.data.filePath);
    
    if (!extractionResult.success) {
      throw new Error(`Failed to extract images from comic file: ${job.data.filePath}`);
    }
    
    apiLogger.info(`Extracted ${extractionResult.pageCount} pages from comic file: ${job.data.filePath}`);
    
    const { pages: imagePaths, extractedPath, coverImagePath } = extractionResult;

    // ============== PROCESS INDIVIDUAL PAGES ==============
    for (const imagePath of imagePaths) {
      const pageNumber = imagePaths.indexOf(imagePath) + 1;
      const imageHash = await calculateFileHash(imagePath);
      const relativePath = imagePath.split('/').pop() || imagePath; // Get filename only

      const pageId = await insertComicPage(job.data.comicId, relativePath, pageNumber, imageHash);
      apiLogger.info(`Inserted comic page with ID: ${pageId} for comic ID: ${job.data.comicId}`);
    }

    // ============== PROCESS COVER IMAGE ==============
    if (coverImagePath) {
      const relativeCoverPath = coverImagePath.split('/').pop() || coverImagePath; // Get filename only
      const coverId = await insertComicBookCover(job.data.comicId, relativeCoverPath);
      apiLogger.info(`Inserted comic book cover with ID: ${coverId} for comic ID: ${job.data.comicId}`);
    } else {
      queueLogger.warn(`No cover image found during extraction for comic file: ${job.data.filePath}`);
    }

    // ============== CLEANUP TEMPORARY FILES ==============
    if (extractedPath) {
      await deleteFolderRecursive(extractedPath);
      apiLogger.info(`Cleaned up extracted files at path: ${extractedPath}`);
    } else {
      queueLogger.warn(`No extracted path to clean up for comic file: ${job.data.filePath}`);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(`Error processing comic file images ${job.data.filePath}: ${errorMessage}`);
    throw error;
  }
}

/**
 * Processes comic series information
 */
async function processComicSeries(job: { data: { seriesPath: string; comicId: number; metadata: ComicMetadata } }): Promise<void> {
  try {
    queueLogger.info(`Processing comic series for path: ${job.data.seriesPath}`);
    
    const seriesName = job.data.seriesPath.split('/').pop();
    if (!seriesName) {
      throw new Error(`Could not extract series name from path: ${job.data.seriesPath}`);
    }
    
    const seriesData = {
      name: job.data.metadata?.comicInfoXml?.series || seriesName,
      description: null,
      folder_path: job.data.seriesPath,
    };

    const seriesId = await insertComicSeries(seriesData);
    apiLogger.info(`Inserted new comic series with ID: ${seriesId} for path: ${job.data.seriesPath}`);
      
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(`Error processing comic series ${job.data.seriesPath}: ${errorMessage}`);
    throw error;
  }
}

/**
 * Process comic web link
 */
function processComicWebLink(job: { data: { comicId: number; url: string } }): void {
  try {
    queueLogger.info(`Processing comic web link: ${job.data.url} for comic ID: ${job.data.comicId}`);
    
    // Placeholder for web link processing logic
    // This would typically involve storing web links or fetching additional metadata
    apiLogger.info(`Processed web link: ${job.data.url} for comic ID: ${job.data.comicId}`);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(`Error processing comic web link ${job.data.url}: ${errorMessage}`);
    throw error;
  }
}

// ==================================================================================
// QUEUE HELPER FUNCTIONS - Organize job creation
// ==================================================================================

/**
 * Queue image processing job
 */
async function queueImageProcessing(comicId: number, filePath: string): Promise<void> {
  await appQueue.add("processComicFileImages", {
    filePath: filePath,
    comicId: comicId
  });
}

/**
 * Queue web link processing jobs
 */
async function queueWebLinkProcessing(comicId: number, webLinks?: string[]): Promise<void> {
  if (webLinks && webLinks.length > 0) {
    for (const webLink of webLinks) {
      queueLogger.info(`Adding web link processing job for web link: ${webLink} and comic ID: ${comicId}`);
      
      await appQueue.add("processComicWebLink", {
        comicId: comicId,
        url: webLink
      });
      
      apiLogger.info(`Added web link processing job for web link: ${webLink} and comic ID: ${comicId}`);
    }
  }
}

/**
 * Queue series processing job if needed
 */
async function queueSeriesProcessing(comicId: number, filePath: string, metadata: ComicMetadata | null): Promise<void> {
  const parentPath = dirname(filePath);
  queueLogger.info(`Checking for comic series at path: ${parentPath}`);
  
  const existingSeries = await getComicSeriesByPath(parentPath);
  
  if (!existingSeries) {
    queueLogger.info(`No existing series found for path: ${parentPath}, adding series processing job to queue`);
    
    await appQueue.add("processComicSeries", {
      seriesPath: parentPath, 
      comicId: comicId,
      metadata: metadata
    });
    
    apiLogger.info(`Added series processing job for path: ${parentPath}`);
  } else {
    queueLogger.info(`Series already exists for path: ${parentPath}, series ID: ${existingSeries.id}`);
  }
}

/**
 * Queue all creator-related processing jobs
 */
async function queueCreatorProcessing(comicId: number, metadata: { 
  writers?: string[]; 
  pencillers?: string[]; 
  inkers?: string[]; 
  colorists?: string[];
  letterers?: string[];
  editors?: string[];
  coverArtists?: string[];
} | null): Promise<void> {
  await queueCreatorJobs(comicId, metadata?.writers, "processComicWriter", "writerName");
  await queueCreatorJobs(comicId, metadata?.pencillers, "processComicPenciller", "pencillerName");
  await queueCreatorJobs(comicId, metadata?.inkers, "processComicInker", "inkerName");
  await queueCreatorJobs(comicId, metadata?.colorists, "processComicColorist", "coloristName");
  await queueCreatorJobs(comicId, metadata?.letterers, "processComicLetterer", "lettererName");
  await queueCreatorJobs(comicId, metadata?.editors, "processComicEditor", "editorName");
  await queueCreatorJobs(comicId, metadata?.coverArtists, "processComicCoverArtist", "coverArtistName");
}

/**
 * Queue all publisher/content-related processing jobs
 */
async function queuePublisherContentProcessing(comicId: number, metadata: {
  publisher?: string[];
  imprint?: string[];
  genres?: string[];
  characters?: string[];
  teams?: string[];
  locations?: string[];
  storyArcs?: string[];
  seriesGroups?: string[];
} | null): Promise<void> {
  await queueCreatorJobs(comicId, metadata?.publisher, "processComicPublisher", "publisherName");
  await queueCreatorJobs(comicId, metadata?.imprint, "processComicImprint", "imprintName");
  await queueCreatorJobs(comicId, metadata?.genres, "processComicGenre", "genreName");
  await queueCreatorJobs(comicId, metadata?.characters, "processComicCharacter", "characterName");
  await queueCreatorJobs(comicId, metadata?.teams, "processComicTeam", "teamName");
  await queueCreatorJobs(comicId, metadata?.locations, "processComicLocation", "locationName");
  await queueCreatorJobs(comicId, metadata?.storyArcs, "processComicStoryArc", "storyArcName");
  await queueCreatorJobs(comicId, metadata?.seriesGroups, "processComicSeriesGroup", "seriesGroupName");
}

/**
 * Generic helper to queue creator/content jobs
 */
async function queueCreatorJobs(
  comicId: number, 
  items: string[] | undefined, 
  jobType: string, 
  paramName: string
): Promise<void> {
  if (items && items.length > 0) {
    for (const item of items) {
      queueLogger.info(`Adding ${jobType} job for ${item} and comic ID: ${comicId}`);
      
      await appQueue.add(jobType, {
        [paramName]: item,
        comicId: comicId
      });
      
      apiLogger.info(`Added ${jobType} job for ${item} and comic ID: ${comicId}`);
    }
  }
}

// ==================================================================================
// CREATOR PROCESSING FUNCTIONS - Handle individual creators and contributors
// ==================================================================================

/**
 * Process comic writer
 */
async function processComicWriter(job: { data: { writerName: string; comicId: number } }): Promise<void> {
  try {
    queueLogger.info(`Processing comic writer: ${job.data.writerName} for comic ID: ${job.data.comicId}`);
    
    const writerId = await insertComicWriter(job.data.writerName);
    apiLogger.info(`Obtained comic writer ID: ${writerId} for name: ${job.data.writerName}`);
    
    await linkWriterToComicBook(writerId, job.data.comicId);
    apiLogger.info(`Linked writer ID: ${writerId} to comic ID: ${job.data.comicId}`);
      
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(`Error processing comic writer ${job.data.writerName}: ${errorMessage}`);
    throw error;
  }
}

/**
 * Process comic penciller
 */
async function processComicPenciller(job: { data: { pencillerName: string; comicId: number } }): Promise<void> {
  try {
    queueLogger.info(`Processing comic penciller: ${job.data.pencillerName} for comic ID: ${job.data.comicId}`);
    
    const pencillerId = await insertComicPenciller(job.data.pencillerName);
    apiLogger.info(`Obtained comic penciller ID: ${pencillerId} for name: ${job.data.pencillerName}`);
    
    await linkPencillerToComicBook(pencillerId, job.data.comicId);
    apiLogger.info(`Linked penciller ID: ${pencillerId} to comic ID: ${job.data.comicId}`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(`Error processing comic penciller ${job.data.pencillerName}: ${errorMessage}`);
    throw error;
  }
}

/**
 * Process comic inker
 */
async function processComicInker(job: { data: { inkerName: string; comicId: number } }): Promise<void> {
  try {
    queueLogger.info(`Processing comic inker: ${job.data.inkerName} for comic ID: ${job.data.comicId}`);
    
    const inkerId = await insertComicInker(job.data.inkerName);
    apiLogger.info(`Obtained comic inker ID: ${inkerId} for name: ${job.data.inkerName}`);
    
    await linkInkerToComicBook(inkerId, job.data.comicId);
    apiLogger.info(`Linked inker ID: ${inkerId} to comic ID: ${job.data.comicId}`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(`Error processing comic inker ${job.data.inkerName}: ${errorMessage}`);
    throw error;
  }
}

/**
 * Process comic colorist
 */
async function processComicColorist(job: { data: { coloristName: string; comicId: number } }): Promise<void> {
  try {
    queueLogger.info(`Processing comic colorist: ${job.data.coloristName} for comic ID: ${job.data.comicId}`);
    
    const coloristId = await insertComicColorist(job.data.coloristName);
    apiLogger.info(`Obtained comic colorist ID: ${coloristId} for name: ${job.data.coloristName}`);
    
    await linkColoristToComicBook(coloristId, job.data.comicId);
    apiLogger.info(`Linked colorist ID: ${coloristId} to comic ID: ${job.data.comicId}`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(`Error processing comic colorist ${job.data.coloristName}: ${errorMessage}`);
    throw error;
  }
}

/**
 * Process comic letterer
 */
async function processComicLetterer(job: { data: { lettererName: string; comicId: number } }): Promise<void> {
  try {
    queueLogger.info(`Processing comic letterer: ${job.data.lettererName} for comic ID: ${job.data.comicId}`);
    
    const lettererId = await insertComicLetterer(job.data.lettererName);
    apiLogger.info(`Obtained comic letterer ID: ${lettererId} for name: ${job.data.lettererName}`);
    
    await linkLettererToComicBook(lettererId, job.data.comicId);
    apiLogger.info(`Linked letterer ID: ${lettererId} to comic ID: ${job.data.comicId}`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(`Error processing comic letterer ${job.data.lettererName}: ${errorMessage}`);
    throw error;
  }
}

/**
 * Process comic editor
 */
async function processComicEditor(job: { data: { editorName: string; comicId: number } }): Promise<void> {
  try {
    queueLogger.info(`Processing comic editor: ${job.data.editorName} for comic ID: ${job.data.comicId}`);
    
    const editorId = await insertComicEditor(job.data.editorName);
    apiLogger.info(`Obtained comic editor ID: ${editorId} for name: ${job.data.editorName}`);
    
    await linkEditorToComicBook(editorId, job.data.comicId);
    apiLogger.info(`Linked editor ID: ${editorId} to comic ID: ${job.data.comicId}`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(`Error processing comic editor ${job.data.editorName}: ${errorMessage}`);
    throw error;
  }
}

/**
 * Process comic cover artist
 */
async function processComicCoverArtist(job: { data: { coverArtistName: string; comicId: number } }): Promise<void> {
  try {
    queueLogger.info(`Processing comic cover artist: ${job.data.coverArtistName} for comic ID: ${job.data.comicId}`);
    
    const coverArtistId = await insertComicCoverArtist(job.data.coverArtistName);
    apiLogger.info(`Obtained comic cover artist ID: ${coverArtistId} for name: ${job.data.coverArtistName}`);
    
    await linkCoverArtistToComicBook(coverArtistId, job.data.comicId);
    apiLogger.info(`Linked cover artist ID: ${coverArtistId} to comic ID: ${job.data.comicId}`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(`Error processing comic cover artist ${job.data.coverArtistName}: ${errorMessage}`);
    throw error;
  }
}

// ==================================================================================
// PUBLISHER/CONTENT PROCESSING FUNCTIONS - Handle publishers, genres, characters, etc.
// ==================================================================================

/**
 * Process comic publisher
 */
async function processComicPublisher(job: { data: { publisherName: string; comicId: number } }): Promise<void> {
  try {
    queueLogger.info(`Processing comic publisher: ${job.data.publisherName} for comic ID: ${job.data.comicId}`);
    
    const publisherId = await insertComicPublisher(job.data.publisherName);
    apiLogger.info(`Obtained comic publisher ID: ${publisherId} for name: ${job.data.publisherName}`);
    
    await linkPublisherToComicBook(publisherId, job.data.comicId);
    apiLogger.info(`Linked publisher ID: ${publisherId} to comic ID: ${job.data.comicId}`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(`Error processing comic publisher ${job.data.publisherName}: ${errorMessage}`);
    throw error;
  }
}

/**
 * Process comic imprint
 */
async function processComicImprint(job: { data: { imprintName: string; comicId: number } }): Promise<void> {
  try {
    queueLogger.info(`Processing comic imprint: ${job.data.imprintName} for comic ID: ${job.data.comicId}`);
    
    const imprintId = await insertComicImprint(job.data.imprintName);
    apiLogger.info(`Obtained comic imprint ID: ${imprintId} for name: ${job.data.imprintName}`);
    
    await linkImprintToComicBook(imprintId, job.data.comicId);
    apiLogger.info(`Linked imprint ID: ${imprintId} to comic ID: ${job.data.comicId}`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(`Error processing comic imprint ${job.data.imprintName}: ${errorMessage}`);
    throw error;
  }
}

/**
 * Process comic genre
 */
async function processComicGenre(job: { data: { genreName: string; comicId: number } }): Promise<void> {
  try {
    queueLogger.info(`Processing comic genre: ${job.data.genreName} for comic ID: ${job.data.comicId}`);
    
    const genreId = await insertComicGenre(job.data.genreName);
    apiLogger.info(`Obtained comic genre ID: ${genreId} for name: ${job.data.genreName}`);
    
    await linkGenreToComicBook(genreId, job.data.comicId);
    apiLogger.info(`Linked genre ID: ${genreId} to comic ID: ${job.data.comicId}`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(`Error processing comic genre ${job.data.genreName}: ${errorMessage}`);
    throw error;
  }
}

/**
 * Process comic character
 */
async function processComicCharacter(job: { data: { characterName: string; comicId: number } }): Promise<void> {
  try {
    queueLogger.info(`Processing comic character: ${job.data.characterName} for comic ID: ${job.data.comicId}`);
    
    const characterId = await insertComicCharacter(job.data.characterName);
    apiLogger.info(`Obtained comic character ID: ${characterId} for name: ${job.data.characterName}`);
    
    await linkCharacterToComicBook(characterId, job.data.comicId);
    apiLogger.info(`Linked character ID: ${characterId} to comic ID: ${job.data.comicId}`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(`Error processing comic character ${job.data.characterName}: ${errorMessage}`);
    throw error;
  }
}

/**
 * Process comic team
 */
async function processComicTeam(job: { data: { teamName: string; comicId: number } }): Promise<void> {
  try {
    queueLogger.info(`Processing comic team: ${job.data.teamName} for comic ID: ${job.data.comicId}`);
    
    const teamId = await insertComicTeam(job.data.teamName);
    apiLogger.info(`Obtained comic team ID: ${teamId} for name: ${job.data.teamName}`);
    
    await linkTeamToComicBook(teamId, job.data.comicId);
    apiLogger.info(`Linked team ID: ${teamId} to comic ID: ${job.data.comicId}`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(`Error processing comic team ${job.data.teamName}: ${errorMessage}`);
    throw error;
  }
}

/**
 * Process comic location
 */
async function processComicLocation(job: { data: { locationName: string; comicId: number } }): Promise<void> {
  try {
    queueLogger.info(`Processing comic location: ${job.data.locationName} for comic ID: ${job.data.comicId}`);
    
    const locationId = await insertComicLocation(job.data.locationName);
    apiLogger.info(`Obtained comic location ID: ${locationId} for name: ${job.data.locationName}`);
    
    await linkLocationToComicBook(locationId, job.data.comicId);
    apiLogger.info(`Linked location ID: ${locationId} to comic ID: ${job.data.comicId}`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(`Error processing comic location ${job.data.locationName}: ${errorMessage}`);
    throw error;
  }
}

/**
 * Process comic story arc
 */
async function processComicStoryArc(job: { data: { storyArcName: string; comicId: number } }): Promise<void> {
  try {
    queueLogger.info(`Processing comic story arc: ${job.data.storyArcName} for comic ID: ${job.data.comicId}`);
    
    const storyArcId = await insertComicStoryArc(job.data.storyArcName);
    apiLogger.info(`Obtained comic story arc ID: ${storyArcId} for name: ${job.data.storyArcName}`);
    
    await linkStoryArcToComicBook(storyArcId, job.data.comicId);
    apiLogger.info(`Linked story arc ID: ${storyArcId} to comic ID: ${job.data.comicId}`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(`Error processing comic story arc ${job.data.storyArcName}: ${errorMessage}`);
    throw error;
  }
}

/**
 * Process comic series group
 */
async function processComicSeriesGroup(job: { data: { seriesGroupName: string; comicId: number } }): Promise<void> {
  try {
    queueLogger.info(`Processing comic series group: ${job.data.seriesGroupName} for comic ID: ${job.data.comicId}`);
    
    const seriesGroupId = await insertComicSeriesGroup(job.data.seriesGroupName);
    apiLogger.info(`Obtained comic series group ID: ${seriesGroupId} for name: ${job.data.seriesGroupName}`);
    
    await linkSeriesGroupToComicBook(seriesGroupId, job.data.comicId);
    apiLogger.info(`Linked series group ID: ${seriesGroupId} to comic ID: ${job.data.comicId}`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(`Error processing comic series group ${job.data.seriesGroupName}: ${errorMessage}`);
    throw error;
  }
}

// ==================================================================================
// WORKER CONFIGURATION AND UTILITY FUNCTIONS
// ==================================================================================

/**
 * Helper function to find library ID from file path
 */
const findLibraryIdFromPath = async (filePath: string): Promise<number | null> => {
  const library = await getLibraryContainingPath(filePath);
  
  if (library) {
    queueLogger.info(`Found library ID ${library.id} ("${library.name}") containing file: ${filePath}`);
    return library.id;
  } else {
    queueLogger.info(`No library found containing file: ${filePath}`);
    return null;
  }
};

/**
 * Main BullMQ worker instance for processing comic book files and metadata
 * Handles all comic-related job types with proper error handling and logging
 */
export const comicFileWorker = new Worker(
	"appQueue",
		async (job) => {
		queueLogger.info(`Worker received job: ${job.name} with ID: ${job.id}`);
		switch (job.name) {
			case "newComicFile":
				await processNewComicFile(job);
				break;
      case "processComicFileImages":
        await processComicFileImages(job);
        break;
      case "processComicWebLink":
        processComicWebLink(job);
        break;
      case "processComicSeries":
				await processComicSeries(job);
				break;
      case "processComicWriter":
				await processComicWriter(job);
				break;
			case "processComicPenciller":
				await processComicPenciller(job);
				break;
      case "processComicInker":
        await processComicInker(job);
        break;
      case "processComicColorist":
        await processComicColorist(job);
        break;
      case "processComicLetterer":
        await processComicLetterer(job);
        break;
      case "processComicEditor":
        await processComicEditor(job);
        break;
      case "processComicCoverArtist":
        await processComicCoverArtist(job);
        break;
      case "processComicPublisher":
        await processComicPublisher(job);
        break;
      case "processComicImprint":
        await processComicImprint(job);
        break;
      case "processComicGenre":
        await processComicGenre(job);
        break;
      case "processComicCharacter":
        await processComicCharacter(job);
        break;
      case "processComicTeam":
        await processComicTeam(job);
        break;
      case "processComicLocation":
        await processComicLocation(job);
        break;
      case "processComicStoryArc":
        await processComicStoryArc(job);
        break;
      case "processComicSeriesGroup":
        await processComicSeriesGroup(job);
        break;
      default:
        queueLogger.warn(`Unknown job type: ${job.name}`);
		}
	},
	{ connection: redisConnection }
);

// ==================================================================================
// WORKER EVENT HANDLERS
// ==================================================================================

comicFileWorker.on("completed", (job) => {
	queueLogger.info(`Worker Job ${job.id} has completed`);
});

comicFileWorker.on("failed", (job, err) => {
	queueLogger.error(`Worker Job ${job?.id} has failed with error: ${err.message}`);
});

comicFileWorker.on("error", (err) => {
	queueLogger.error(`Worker error: ${err.message}`);
});

// ==================================================================================
// END OF FILE - Comic Worker Implementation Complete
// ==================================================================================
