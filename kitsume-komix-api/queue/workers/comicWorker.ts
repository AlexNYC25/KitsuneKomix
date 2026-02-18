// ==================================================================================
// COMIC WORKER - Processes comic book files and related metadata
// ==================================================================================

// Standard library imports
import { MetadataCompiled } from "comic-metadata-tool";
import { Worker } from "bullmq";
import { dirname } from "@std/path";

// Utility imports
import { deleteFolderRecursive, getFileSize } from "#utilities/file.ts";
import { getImageDimensions } from "#utilities/imageUtils.ts";
import { getMetadata, standardizeMetadata } from "#utilities/metadata.ts";
import { calculateFileHash } from "#utilities/hash.ts";
import { extractComicBook } from "#utilities/extract.ts";
import {
  getComicFileRawDetails,
  getComicSeriesRawDetails,
} from "#utilities/comic-parser.ts";
import { createImageThumbnail } from "#utilities/image.ts";

// Queue and configuration imports
import { appQueue } from "../queueManager.ts";
import { redisConnection } from "../../db/redis/redisConnection.ts";
import { apiLogger, queueLogger } from "../../logger/loggers.ts";

// Interface imports
import { ComicMetadata } from "#interfaces/index.ts";

// Database model imports - Core models
import {
  getComicBookByFilePath,
  insertComicBook,
  updateComicBook,
} from "#sqlite/models/comicBooks.model.ts";
import {
  addComicBookToSeries,
  getComicSeriesByPath,
  insertComicSeries,
  insertComicSeriesIntoLibrary,
} from "#sqlite/models/comicSeries.model.ts";
import { getLibraryContainingPath } from "#sqlite/models/comicLibraries.model.ts";
import { insertComicPage } from "#sqlite/models/comicPages.model.ts";
import { insertComicBookCover } from "#sqlite/models/comicBookCovers.model.ts";
import { insertComicBookThumbnail } from "#sqlite/models/comicBookThumbnails.model.ts";

// Database model imports - People/Creators
import {
  insertComicWriter,
  linkWriterToComicBook,
} from "#sqlite/models/comicWriters.model.ts";
import {
  insertComicPenciller,
  linkPencillerToComicBook,
} from "#sqlite/models/comicPencillers.model.ts";
import {
  insertComicInker,
  linkInkerToComicBook,
} from "#sqlite/models/comicInkers.model.ts";
import {
  insertComicColorist,
  linkColoristToComicBook,
} from "#sqlite/models/comicColorists.model.ts";
import {
  insertComicLetterer,
  linkLettererToComicBook,
} from "#sqlite/models/comicLetterers.model.ts";
import {
  insertComicEditor,
  linkEditorToComicBook,
} from "#sqlite/models/comicEditors.model.ts";
import {
  insertComicCoverArtist,
  linkCoverArtistToComicBook,
} from "#sqlite/models/comicCoverArtists.model.ts";

// Database model imports - Publishers/Content
import {
  insertComicPublisher,
  linkPublisherToComicBook,
} from "#sqlite/models/comicPublishers.model.ts";
import {
  insertComicImprint,
  linkImprintToComicBook,
} from "#sqlite/models/comicImprints.model.ts";
import {
  insertComicGenre,
  linkGenreToComicBook,
} from "#sqlite/models/comicGenres.model.ts";
import {
  insertComicCharacter,
  linkCharacterToComicBook,
} from "#sqlite/models/comicCharacters.model.ts";
import {
  insertComicTeam,
  linkTeamToComicBook,
} from "#sqlite/models/comicTeams.model.ts";
import {
  insertComicLocation,
  linkLocationToComicBook,
} from "#sqlite/models/comicLocations.model.ts";
import {
  insertComicStoryArc,
  linkStoryArcToComicBook,
} from "#sqlite/models/comicStoryArcs.model.ts";
import {
  insertComicSeriesGroup,
  linkSeriesGroupToComicBook,
} from "#sqlite/models/comicSeriesGroups.model.ts";
import { StandardizedComicMetadata } from "#interfaces/index.ts";

import { NewComicBook, NewComicSeries, WorkerJob } from "#types/index.ts";

// ==================================================================================
// MAIN PROCESSING FUNCTIONS
// ==================================================================================

/**
 * Main comic file processing function
 * Handles metadata extraction, hash calculation, and initiates all follow-up jobs
 * Only processes new files or files with changed hash values
 *
 * NOTE: This should be the orchestrating function that calls all other processing steps and queues follow-up jobs as needed
 */
async function processNewComicFile(
  job: WorkerJob,
): Promise<void> {
  queueLogger.info(`Processing comic file: ${job.data.filePath}`);

  try {
    // ============== CHECK IF FILE EXISTS AND COMPARE HASH ==============
    const existingComic = await getComicBookByFilePath(job.data.filePath);
    const fileHash = await calculateFileHash(job.data.filePath);

    // If comic exists and hash hasn't changed, skip processing
    if (existingComic && existingComic.hash === fileHash) {
      queueLogger.info(
        `Skipping processing for ${job.data.filePath} - file unchanged (hash: ${fileHash})`,
      );
      return;
    }

    // ============== METADATA AND LIBRARY PROCESSING ==============
    const metadata: MetadataCompiled | null = await getMetadata(
      job.data.filePath,
    );
    const libraryId: number | null = await findLibraryIdFromPath(
      job.data.filePath,
    );

    const rawFileDetails = getComicFileRawDetails(job.data.filePath);

    if (!libraryId) {
      throw new Error(
        `Could not determine library ID for file path: ${job.data.filePath}`,
      );
    }

    const standardizedMetadata: StandardizedComicMetadata | null =
      await standardizeMetadata(job.data.filePath);

    // ============== COMIC BOOK DATA PREPARATION ==============
    const comicData = {
      library_id: libraryId,
      file_path: job.data.filePath,
      hash: fileHash,
      title: standardizedMetadata?.title || null,
      series: standardizedMetadata?.series || rawFileDetails.series || null,
      issue_number: standardizedMetadata?.issueNumber || rawFileDetails.issue ||
        null,
      count: standardizedMetadata?.count || null,
      volume: standardizedMetadata?.volume || rawFileDetails.volume || null,
      alternate_series: standardizedMetadata?.alternateSeries || null,
      alternate_issue_number: standardizedMetadata?.alternateNumber || null,
      alternate_count: standardizedMetadata?.alternateCount || null,
      page_count: standardizedMetadata?.pageCount || null,
      file_size: await getFileSize(job.data.filePath),
      summary: standardizedMetadata?.summary || null,
      notes: standardizedMetadata?.notes || null,
      year: standardizedMetadata?.year || Number(rawFileDetails.year) || null,
      month: standardizedMetadata?.month || null,
      day: standardizedMetadata?.day || null,
      publisher: standardizedMetadata?.publisher?.[0] || null,
      publication_date: standardizedMetadata?.year
        ? `${standardizedMetadata.year}-${
          String(standardizedMetadata.month || 1).padStart(2, "0")
        }-${String(standardizedMetadata.day || 1).padStart(2, "0")}`
        : null,
      scan_info: standardizedMetadata?.scanInfo || null,
      language: standardizedMetadata?.language || null,
      format: standardizedMetadata?.format || null,
      black_and_white: standardizedMetadata?.blackAndWhite ? 1 : 0,
      manga: standardizedMetadata?.manga ? 1 : 0,
      reading_direction: standardizedMetadata?.readingDirection || null,
      review: standardizedMetadata?.review || null,
      age_rating: standardizedMetadata?.ageRating || null,
      community_rating: standardizedMetadata?.communityRating || null,
      story_arcs: standardizedMetadata?.storyArcs || null,
      series_groups: standardizedMetadata?.seriesGroups || null,
    };

    let comicId: number;

    // ============== INSERT OR UPDATE COMIC BOOK RECORD ==============
    if (existingComic) {
      // Update existing record
      await updateComicBook(existingComic.id, comicData);
      comicId = existingComic.id;
      apiLogger.info(
        `Updated existing comic book with ID: ${comicId} (hash changed)`,
      );
    } else {
      // Insert new record
      const newRecord: NewComicBook = {
        libraryId: comicData.library_id,
        filePath: comicData.file_path,
        hash: comicData.hash,
        title: comicData.title,
        series: comicData.series,
        issueNumber: comicData.issue_number,
        count: comicData.count,
        volume: comicData.volume,
        alternateSeries: comicData.alternate_series,
        alternateIssueNumber: comicData.alternate_issue_number,
        alternateCount: comicData.alternate_count,
        pageCount: comicData.page_count,
        fileSize: comicData.file_size,
        summary: comicData.summary,
        notes: comicData.notes,
        year: comicData.year,
        month: comicData.month,
        day: comicData.day,
        publisher: comicData.publisher,
        publicationDate: comicData.publication_date,
        scanInfo: comicData.scan_info,
        language: comicData.language,
        format: comicData.format,
        blackAndWhite: comicData.black_and_white,
        manga: comicData.manga,
        readingDirection: comicData.reading_direction,
        review: comicData.review,
        ageRating: comicData.age_rating,
        communityRating: comicData.community_rating,
      };

      comicId = await insertComicBook(newRecord);
      apiLogger.info(`Inserted new comic book with ID: ${comicId}`);
    }

    // ============== QUEUE FOLLOW-UP JOBS ==============
    // Only queue follow-up jobs for new files or files with changed hash

    // Queue image processing
    await queueImageProcessing(comicId, job.data.filePath);

    // Queue web link processing if available
    await queueWebLinkProcessing(comicId, standardizedMetadata?.web);

    const rawSeriesDetails = getComicSeriesRawDetails(
      job.data.filePath.split("/").slice(0, -1).join("/"),
    );

    // Queue series processing if needed
    // Prepare comic metadata - prioritize folder-based series info over file metadata
    const comicMetadata: ComicMetadata | null = metadata
      ? {
        comicInfoXml: metadata.comicInfoXml,
        filePath: job.data.filePath,
        ...metadata,
      }
      : {
        // When no file metadata available, use folder-based series information
        comicInfoXml: {
          series: rawSeriesDetails.series,
          volume: rawSeriesDetails.volume
            ? Number(rawSeriesDetails.volume)
            : undefined,
          year: rawSeriesDetails.year
            ? Number(rawSeriesDetails.year)
            : undefined,
        },
        filePath: job.data.filePath,
      };

    await queueSeriesProcessing(comicId, job.data.filePath, comicMetadata);

    // Queue creator processing
    await queueCreatorProcessing(comicId, standardizedMetadata);

    // Queue publisher/content processing
    await queuePublisherContentProcessing(comicId, standardizedMetadata);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(
      `Error processing comic file ${job.data.filePath}: ${errorMessage}`,
    );
    throw error;
  }
}

/**
 * Processes comic file images - extracts, hashes, and stores page/cover data
 */
async function processComicFileImages(
  job: { data: { filePath: string; comicId: number } },
): Promise<void> {
  try {
    queueLogger.info(
      `Processing comic file images for file: ${job.data.filePath} and comic ID: ${job.data.comicId}`,
    );

    // ============== GET STANDARDIZED METADATA ==============
    const standardizedMetadata = await standardizeMetadata(job.data.filePath);
    const metadataPages = standardizedMetadata?.pages || [];

    queueLogger.info(
      `Found ${metadataPages.length} metadata pages for comic: ${job.data.filePath}`,
    );

    // Log page types for debugging
    if (metadataPages.length > 0) {
      const pageTypes = metadataPages.map((page) =>
        `${page.image}:${page.type}`
      ).join(", ");
      queueLogger.info(`Page types from metadata: ${pageTypes}`);
    }

    // ============== EXTRACT COMIC IMAGES ==============
    const extractionResult = await extractComicBook(job.data.filePath);

    if (!extractionResult.success) {
      throw new Error(
        `Failed to extract images from comic file: ${job.data.filePath}`,
      );
    }

    apiLogger.info(
      `Extracted ${extractionResult.pageCount} pages from comic file: ${job.data.filePath}`,
    );

    const {
      pages: imagePaths,
      extractedPath,
      coverImagePath: _coverImagePath,
    } = extractionResult;

    // ============== PROCESS INDIVIDUAL PAGES ==============
    const coverPages: Array<
      { pageId: number; imagePath: string; pageNumber: number }
    > = [];

    for (const imagePath of imagePaths) {
      const pageNumber = imagePaths.indexOf(imagePath) + 1;
      const imageHash = await calculateFileHash(imagePath);
      const relativePath = imagePath.split("/").pop() || imagePath; // Get filename only

      // Find corresponding metadata page (image field contains page number as string)
      const metadataPage = metadataPages.find((page) =>
        parseInt(page.image) === pageNumber
      );

      if (metadataPage) {
        queueLogger.info(
          `Found metadata for page ${pageNumber}: type="${metadataPage.type}", doublePage=${metadataPage.doublePage}, size=${metadataPage.size}, dimensions=${metadataPage.width}x${metadataPage.height}`,
        );
      } else {
        queueLogger.info(
          `No metadata found for page ${pageNumber}, using manual detection`,
        );
      }

      // Use metadata values when available, otherwise determine manually
      let fileSize: number;
      let imageWidth: number | null = null;
      let imageHeight: number | null = null;

      if (metadataPage?.size && metadataPage?.width && metadataPage?.height) {
        // Use metadata values
        fileSize = metadataPage.size;
        imageWidth = metadataPage.width;
        imageHeight = metadataPage.height;
        queueLogger.info(
          `Using metadata for page ${pageNumber}: ${metadataPage.width}x${metadataPage.height}, ${metadataPage.size} bytes`,
        );
      } else {
        // Manually determine values
        fileSize = await getFileSize(imagePath);
        const dimensions = await getImageDimensions(imagePath);
        imageWidth = dimensions?.width || null;
        imageHeight = dimensions?.height || null;
        queueLogger.info(
          `Manually determined for page ${pageNumber}: ${imageWidth}x${imageHeight}, ${fileSize} bytes`,
        );
      }

      const pageData = {
        comic_book_id: job.data.comicId,
        file_path: relativePath,
        page_number: pageNumber,
        type: metadataPage?.type || (pageNumber === 1 ? "Cover" : "Story"),
        double_page: metadataPage?.doublePage ? 1 : 0,
        width: imageWidth,
        length: imageHeight,
        hash: imageHash,
        file_size: fileSize,
      };

      const pageId = await insertComicPage(
        pageData.comic_book_id,
        pageData.file_path,
        pageData.page_number,
        pageData.hash,
        pageData.file_size,
        pageData.type,
        pageData.double_page,
        pageData.width,
        pageData.length,
      );

      apiLogger.info(
        `Inserted comic page with ID: ${pageId} for comic ID: ${job.data.comicId}, page ${pageNumber}`,
      );

      // Check if this page should be treated as a cover
      const isFirstPage = pageNumber === 1;
      const isFrontCoverFromMetadata = metadataPage?.type === "FrontCover";

      if (isFirstPage || isFrontCoverFromMetadata) {
        coverPages.push({ pageId, imagePath, pageNumber });
        queueLogger.info(
          `Page ${pageNumber} identified as cover page (firstPage: ${isFirstPage}, metadata: ${isFrontCoverFromMetadata})`,
        );
      }
    }

    // ============== PROCESS COVER PAGES ==============
    if (coverPages.length > 0) {
      queueLogger.info(`Processing ${coverPages.length} cover page(s)`);

      for (const coverPage of coverPages) {
        queueLogger.info(
          `Processing cover for page ${coverPage.pageNumber} (ID: ${coverPage.pageId})`,
        );

        // Create cover record pointing to the page
        const coverRelativePath = coverPage.imagePath.split("/").pop() ||
          coverPage.imagePath;
        const coverId = await insertComicBookCover(
          coverPage.pageId,
          coverRelativePath,
        );

        apiLogger.info(
          `Inserted comic book cover with ID: ${coverId} for page ID: ${coverPage.pageId}`,
        );

        // ============== GENERATE THUMBNAIL ==============
        queueLogger.info(
          `Generating thumbnail for cover image: ${coverPage.imagePath}`,
        );

        const thumbnail = await createImageThumbnail(coverPage.imagePath, {
          width: 300,
          height: 450,
        });

        // Insert thumbnail record pointing to the cover
        if (thumbnail.success && thumbnail.thumbnailPath) {
          queueLogger.info(`Inserting thumbnail for cover ID: ${coverId}`);
          const thumbnailId = await insertComicBookThumbnail(
            job.data.comicId,
            coverId,
            thumbnail.thumbnailPath,
          );
          apiLogger.info(
            `Inserted comic book thumbnail with ID: ${thumbnailId} for cover ID: ${coverId}`,
          );
        } else {
          queueLogger.error(
            `Failed to create thumbnail for cover image: ${coverPage.imagePath}. Error: ${
              thumbnail.error || "Unknown error"
            }`,
          );
        }
      }
    } else {
      queueLogger.warn(
        `No cover pages identified for comic file: ${job.data.filePath}`,
      );
    }

    // ============== CLEANUP TEMPORARY FILES ==============
    if (extractedPath) {
      await deleteFolderRecursive(extractedPath);
      apiLogger.info(`Cleaned up extracted files at path: ${extractedPath}`);
    } else {
      queueLogger.warn(
        `No extracted path to clean up for comic file: ${job.data.filePath}`,
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(
      `Error processing comic file images ${job.data.filePath}: ${errorMessage}`,
    );
    throw error;
  }
}

/**
 * Processes comic series information
 */
async function processComicSeries(
  job: {
    data: { seriesPath: string; comicId: number; metadata: ComicMetadata };
  },
): Promise<void> {
  try {
    queueLogger.info(
      `Processing comic series for path: ${job.data.seriesPath}`,
    );

    const seriesName = job.data.seriesPath.split("/").pop();
    if (!seriesName) {
      throw new Error(
        `Could not extract series name from path: ${job.data.seriesPath}`,
      );
    }

    const seriesData: NewComicSeries = {
      name: job.data.metadata?.comicInfoXml?.series || seriesName,
      description: null,
      folderPath: job.data.seriesPath,
    };

    const seriesId = await insertComicSeries(seriesData);
    apiLogger.info(
      `Inserted new comic series with ID: ${seriesId} for path: ${job.data.seriesPath}`,
    );

    // Get the library that contains this series path
    const library = await getLibraryContainingPath(job.data.seriesPath);
    if (library) {
      try {
        await insertComicSeriesIntoLibrary(seriesId, library.id);
        apiLogger.info(
          `Successfully linked comic series ${seriesId} to library ${library.id}`,
        );
      } catch (libraryLinkError) {
        queueLogger.error(
          `Error linking comic series ${seriesId} to library ${library.id}: ${libraryLinkError}`,
        );
        // Don't throw here as the series was successfully created
      }
    } else {
      queueLogger.warn(
        `No library found containing path: ${job.data.seriesPath}`,
      );
    }

    // Link the comic book to the newly created series
    try {
      const linked = await addComicBookToSeries(seriesId, job.data.comicId);
      if (linked) {
        apiLogger.info(
          `Successfully linked comic book ${job.data.comicId} to new series ${seriesId}`,
        );
      } else {
        apiLogger.warn(
          `Comic book ${job.data.comicId} may already be linked to series ${seriesId}`,
        );
      }
    } catch (linkError) {
      queueLogger.error(
        `Error linking comic book ${job.data.comicId} to series ${seriesId}: ${linkError}`,
      );
      // Don't throw here as the series was successfully created
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(
      `Error processing comic series ${job.data.seriesPath}: ${errorMessage}`,
    );
    throw error;
  }
}

/**
 * Process comic web link
 */
function processComicWebLink(
  job: { data: { comicId: number; url: string } },
): void {
  try {
    queueLogger.info(
      `Processing comic web link: ${job.data.url} for comic ID: ${job.data.comicId}`,
    );

    // Placeholder for web link processing logic
    // This would typically involve storing web links or fetching additional metadata
    apiLogger.info(
      `Processed web link: ${job.data.url} for comic ID: ${job.data.comicId}`,
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(
      `Error processing comic web link ${job.data.url}: ${errorMessage}`,
    );
    throw error;
  }
}

// ==================================================================================
// QUEUE HELPER FUNCTIONS - Organize job creation
// ==================================================================================

/**
 * Queue image processing job
 */
async function queueImageProcessing(
  comicId: number,
  filePath: string,
): Promise<void> {
  await appQueue.add("processComicFileImages", {
    filePath: filePath,
    comicId: comicId,
  });
}

/**
 * Queue web link processing jobs
 */
async function queueWebLinkProcessing(
  comicId: number,
  webLinks?: string[],
): Promise<void> {
  if (webLinks && webLinks.length > 0) {
    for (const webLink of webLinks) {
      queueLogger.info(
        `Adding web link processing job for web link: ${webLink} and comic ID: ${comicId}`,
      );

      await appQueue.add("processComicWebLink", {
        comicId: comicId,
        url: webLink,
      });

      apiLogger.info(
        `Added web link processing job for web link: ${webLink} and comic ID: ${comicId}`,
      );
    }
  }
}

/**
 * Queue series processing job if needed
 */
async function queueSeriesProcessing(
  comicId: number,
  filePath: string,
  metadata: ComicMetadata | null,
): Promise<void> {
  const parentPath = dirname(filePath);
  queueLogger.info(`Checking for comic series at path: ${parentPath}`);

  const existingSeries = await getComicSeriesByPath(parentPath);

  if (!existingSeries) {
    queueLogger.info(
      `No existing series found for path: ${parentPath}, adding series processing job to queue`,
    );

    await appQueue.add("processComicSeries", {
      seriesPath: parentPath,
      comicId: comicId,
      metadata: metadata,
    });

    apiLogger.info(`Added series processing job for path: ${parentPath}`);
  } else {
    queueLogger.info(
      `Series already exists for path: ${parentPath}, series ID: ${existingSeries.id}`,
    );

    // Add the comic book to the existing series
    try {
      const linked = await addComicBookToSeries(existingSeries.id, comicId);
      if (linked) {
        apiLogger.info(
          `Successfully linked comic book ${comicId} to existing series ${existingSeries.id}`,
        );
      } else {
        apiLogger.warn(
          `Comic book ${comicId} may already be linked to series ${existingSeries.id}`,
        );
      }
    } catch (error) {
      queueLogger.error(
        `Error linking comic book ${comicId} to series ${existingSeries.id}: ${error}`,
      );
    }
  }
}

/**
 * Queue all creator-related processing jobs
 */
async function queueCreatorProcessing(
  comicId: number,
  metadata: {
    writers?: string[];
    pencillers?: string[];
    inkers?: string[];
    colorists?: string[];
    letterers?: string[];
    editors?: string[];
    coverArtists?: string[];
  } | null,
): Promise<void> {
  await queueCreatorJobs(
    comicId,
    metadata?.writers,
    "processComicWriter",
    "writerName",
  );
  await queueCreatorJobs(
    comicId,
    metadata?.pencillers,
    "processComicPenciller",
    "pencillerName",
  );
  await queueCreatorJobs(
    comicId,
    metadata?.inkers,
    "processComicInker",
    "inkerName",
  );
  await queueCreatorJobs(
    comicId,
    metadata?.colorists,
    "processComicColorist",
    "coloristName",
  );
  await queueCreatorJobs(
    comicId,
    metadata?.letterers,
    "processComicLetterer",
    "lettererName",
  );
  await queueCreatorJobs(
    comicId,
    metadata?.editors,
    "processComicEditor",
    "editorName",
  );
  await queueCreatorJobs(
    comicId,
    metadata?.coverArtists,
    "processComicCoverArtist",
    "coverArtistName",
  );
}

/**
 * Queue all publisher/content-related processing jobs
 */
async function queuePublisherContentProcessing(
  comicId: number,
  metadata: {
    publisher?: string[];
    imprint?: string[];
    genres?: string[];
    characters?: string[];
    teams?: string[];
    locations?: string[];
    storyArcs?: string[];
    seriesGroups?: string[];
  } | null,
): Promise<void> {
  await queueCreatorJobs(
    comicId,
    metadata?.publisher,
    "processComicPublisher",
    "publisherName",
  );
  await queueCreatorJobs(
    comicId,
    metadata?.imprint,
    "processComicImprint",
    "imprintName",
  );
  await queueCreatorJobs(
    comicId,
    metadata?.genres,
    "processComicGenre",
    "genreName",
  );
  await queueCreatorJobs(
    comicId,
    metadata?.characters,
    "processComicCharacter",
    "characterName",
  );
  await queueCreatorJobs(
    comicId,
    metadata?.teams,
    "processComicTeam",
    "teamName",
  );
  await queueCreatorJobs(
    comicId,
    metadata?.locations,
    "processComicLocation",
    "locationName",
  );
  await queueCreatorJobs(
    comicId,
    metadata?.storyArcs,
    "processComicStoryArc",
    "storyArcName",
  );
  await queueCreatorJobs(
    comicId,
    metadata?.seriesGroups,
    "processComicSeriesGroup",
    "seriesGroupName",
  );
}

/**
 * Generic helper to queue creator/content jobs
 */
async function queueCreatorJobs(
  comicId: number,
  items: string[] | undefined,
  jobType: string,
  paramName: string,
): Promise<void> {
  if (items && items.length > 0) {
    for (const item of items) {
      queueLogger.info(
        `Adding ${jobType} job for ${item} and comic ID: ${comicId}`,
      );

      await appQueue.add(jobType, {
        [paramName]: item,
        comicId: comicId,
      });

      apiLogger.info(
        `Added ${jobType} job for ${item} and comic ID: ${comicId}`,
      );
    }
  }
}

// ==================================================================================
// CREATOR PROCESSING FUNCTIONS - Handle individual creators and contributors
// ==================================================================================

/**
 * Process comic writer
 */
async function processComicWriter(
  job: { data: { writerName: string; comicId: number } },
): Promise<void> {
  try {
    queueLogger.info(
      `Processing comic writer: ${job.data.writerName} for comic ID: ${job.data.comicId}`,
    );

    const writerId = await insertComicWriter(job.data.writerName);
    apiLogger.info(
      `Obtained comic writer ID: ${writerId} for name: ${job.data.writerName}`,
    );

    await linkWriterToComicBook(writerId, job.data.comicId);
    apiLogger.info(
      `Linked writer ID: ${writerId} to comic ID: ${job.data.comicId}`,
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(
      `Error processing comic writer ${job.data.writerName}: ${errorMessage}`,
    );
    throw error;
  }
}

/**
 * Process comic penciller
 */
async function processComicPenciller(
  job: { data: { pencillerName: string; comicId: number } },
): Promise<void> {
  try {
    queueLogger.info(
      `Processing comic penciller: ${job.data.pencillerName} for comic ID: ${job.data.comicId}`,
    );

    const pencillerId = await insertComicPenciller(job.data.pencillerName);
    apiLogger.info(
      `Obtained comic penciller ID: ${pencillerId} for name: ${job.data.pencillerName}`,
    );

    await linkPencillerToComicBook(pencillerId, job.data.comicId);
    apiLogger.info(
      `Linked penciller ID: ${pencillerId} to comic ID: ${job.data.comicId}`,
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(
      `Error processing comic penciller ${job.data.pencillerName}: ${errorMessage}`,
    );
    throw error;
  }
}

/**
 * Process comic inker
 */
async function processComicInker(
  job: { data: { inkerName: string; comicId: number } },
): Promise<void> {
  try {
    queueLogger.info(
      `Processing comic inker: ${job.data.inkerName} for comic ID: ${job.data.comicId}`,
    );

    const inkerId = await insertComicInker(job.data.inkerName);
    apiLogger.info(
      `Obtained comic inker ID: ${inkerId} for name: ${job.data.inkerName}`,
    );

    await linkInkerToComicBook(inkerId, job.data.comicId);
    apiLogger.info(
      `Linked inker ID: ${inkerId} to comic ID: ${job.data.comicId}`,
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(
      `Error processing comic inker ${job.data.inkerName}: ${errorMessage}`,
    );
    throw error;
  }
}

/**
 * Process comic colorist
 */
async function processComicColorist(
  job: { data: { coloristName: string; comicId: number } },
): Promise<void> {
  try {
    queueLogger.info(
      `Processing comic colorist: ${job.data.coloristName} for comic ID: ${job.data.comicId}`,
    );

    const coloristId = await insertComicColorist(job.data.coloristName);
    apiLogger.info(
      `Obtained comic colorist ID: ${coloristId} for name: ${job.data.coloristName}`,
    );

    await linkColoristToComicBook(coloristId, job.data.comicId);
    apiLogger.info(
      `Linked colorist ID: ${coloristId} to comic ID: ${job.data.comicId}`,
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(
      `Error processing comic colorist ${job.data.coloristName}: ${errorMessage}`,
    );
    throw error;
  }
}

/**
 * Process comic letterer
 */
async function processComicLetterer(
  job: { data: { lettererName: string; comicId: number } },
): Promise<void> {
  try {
    queueLogger.info(
      `Processing comic letterer: ${job.data.lettererName} for comic ID: ${job.data.comicId}`,
    );

    const lettererId = await insertComicLetterer(job.data.lettererName);
    apiLogger.info(
      `Obtained comic letterer ID: ${lettererId} for name: ${job.data.lettererName}`,
    );

    await linkLettererToComicBook(lettererId, job.data.comicId);
    apiLogger.info(
      `Linked letterer ID: ${lettererId} to comic ID: ${job.data.comicId}`,
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(
      `Error processing comic letterer ${job.data.lettererName}: ${errorMessage}`,
    );
    throw error;
  }
}

/**
 * Process comic editor
 */
async function processComicEditor(
  job: { data: { editorName: string; comicId: number } },
): Promise<void> {
  try {
    queueLogger.info(
      `Processing comic editor: ${job.data.editorName} for comic ID: ${job.data.comicId}`,
    );

    const editorId = await insertComicEditor(job.data.editorName);
    apiLogger.info(
      `Obtained comic editor ID: ${editorId} for name: ${job.data.editorName}`,
    );

    await linkEditorToComicBook(editorId, job.data.comicId);
    apiLogger.info(
      `Linked editor ID: ${editorId} to comic ID: ${job.data.comicId}`,
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(
      `Error processing comic editor ${job.data.editorName}: ${errorMessage}`,
    );
    throw error;
  }
}

/**
 * Process comic cover artist
 */
async function processComicCoverArtist(
  job: { data: { coverArtistName: string; comicId: number } },
): Promise<void> {
  try {
    queueLogger.info(
      `Processing comic cover artist: ${job.data.coverArtistName} for comic ID: ${job.data.comicId}`,
    );

    const coverArtistId = await insertComicCoverArtist(
      job.data.coverArtistName,
    );
    apiLogger.info(
      `Obtained comic cover artist ID: ${coverArtistId} for name: ${job.data.coverArtistName}`,
    );

    await linkCoverArtistToComicBook(coverArtistId, job.data.comicId);
    apiLogger.info(
      `Linked cover artist ID: ${coverArtistId} to comic ID: ${job.data.comicId}`,
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(
      `Error processing comic cover artist ${job.data.coverArtistName}: ${errorMessage}`,
    );
    throw error;
  }
}

// ==================================================================================
// PUBLISHER/CONTENT PROCESSING FUNCTIONS - Handle publishers, genres, characters, etc.
// ==================================================================================

/**
 * Process comic publisher
 */
async function processComicPublisher(
  job: { data: { publisherName: string; comicId: number } },
): Promise<void> {
  try {
    queueLogger.info(
      `Processing comic publisher: ${job.data.publisherName} for comic ID: ${job.data.comicId}`,
    );

    const publisherId = await insertComicPublisher(job.data.publisherName);
    apiLogger.info(
      `Obtained comic publisher ID: ${publisherId} for name: ${job.data.publisherName}`,
    );

    await linkPublisherToComicBook(publisherId, job.data.comicId);
    apiLogger.info(
      `Linked publisher ID: ${publisherId} to comic ID: ${job.data.comicId}`,
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(
      `Error processing comic publisher ${job.data.publisherName}: ${errorMessage}`,
    );
    throw error;
  }
}

/**
 * Process comic imprint
 */
async function processComicImprint(
  job: { data: { imprintName: string; comicId: number } },
): Promise<void> {
  try {
    queueLogger.info(
      `Processing comic imprint: ${job.data.imprintName} for comic ID: ${job.data.comicId}`,
    );

    const imprintId = await insertComicImprint(job.data.imprintName);
    apiLogger.info(
      `Obtained comic imprint ID: ${imprintId} for name: ${job.data.imprintName}`,
    );

    await linkImprintToComicBook(imprintId, job.data.comicId);
    apiLogger.info(
      `Linked imprint ID: ${imprintId} to comic ID: ${job.data.comicId}`,
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(
      `Error processing comic imprint ${job.data.imprintName}: ${errorMessage}`,
    );
    throw error;
  }
}

/**
 * Process comic genre
 */
async function processComicGenre(
  job: { data: { genreName: string; comicId: number } },
): Promise<void> {
  try {
    queueLogger.info(
      `Processing comic genre: ${job.data.genreName} for comic ID: ${job.data.comicId}`,
    );

    const genreId = await insertComicGenre(job.data.genreName);
    apiLogger.info(
      `Obtained comic genre ID: ${genreId} for name: ${job.data.genreName}`,
    );

    await linkGenreToComicBook(genreId, job.data.comicId);
    apiLogger.info(
      `Linked genre ID: ${genreId} to comic ID: ${job.data.comicId}`,
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(
      `Error processing comic genre ${job.data.genreName}: ${errorMessage}`,
    );
    throw error;
  }
}

/**
 * Process comic character
 */
async function processComicCharacter(
  job: { data: { characterName: string; comicId: number } },
): Promise<void> {
  try {
    queueLogger.info(
      `Processing comic character: ${job.data.characterName} for comic ID: ${job.data.comicId}`,
    );

    const characterId = await insertComicCharacter(job.data.characterName);
    apiLogger.info(
      `Obtained comic character ID: ${characterId} for name: ${job.data.characterName}`,
    );

    await linkCharacterToComicBook(characterId, job.data.comicId);
    apiLogger.info(
      `Linked character ID: ${characterId} to comic ID: ${job.data.comicId}`,
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(
      `Error processing comic character ${job.data.characterName}: ${errorMessage}`,
    );
    throw error;
  }
}

/**
 * Process comic team
 */
async function processComicTeam(
  job: { data: { teamName: string; comicId: number } },
): Promise<void> {
  try {
    queueLogger.info(
      `Processing comic team: ${job.data.teamName} for comic ID: ${job.data.comicId}`,
    );

    const teamId = await insertComicTeam(job.data.teamName);
    apiLogger.info(
      `Obtained comic team ID: ${teamId} for name: ${job.data.teamName}`,
    );

    await linkTeamToComicBook(teamId, job.data.comicId);
    apiLogger.info(
      `Linked team ID: ${teamId} to comic ID: ${job.data.comicId}`,
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(
      `Error processing comic team ${job.data.teamName}: ${errorMessage}`,
    );
    throw error;
  }
}

/**
 * Process comic location
 */
async function processComicLocation(
  job: { data: { locationName: string; comicId: number } },
): Promise<void> {
  try {
    queueLogger.info(
      `Processing comic location: ${job.data.locationName} for comic ID: ${job.data.comicId}`,
    );

    const locationId = await insertComicLocation(job.data.locationName);
    apiLogger.info(
      `Obtained comic location ID: ${locationId} for name: ${job.data.locationName}`,
    );

    await linkLocationToComicBook(locationId, job.data.comicId);
    apiLogger.info(
      `Linked location ID: ${locationId} to comic ID: ${job.data.comicId}`,
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(
      `Error processing comic location ${job.data.locationName}: ${errorMessage}`,
    );
    throw error;
  }
}

/**
 * Process comic story arc
 */
async function processComicStoryArc(
  job: { data: { storyArcName: string; comicId: number } },
): Promise<void> {
  try {
    queueLogger.info(
      `Processing comic story arc: ${job.data.storyArcName} for comic ID: ${job.data.comicId}`,
    );

    const storyArcId = await insertComicStoryArc(job.data.storyArcName);
    apiLogger.info(
      `Obtained comic story arc ID: ${storyArcId} for name: ${job.data.storyArcName}`,
    );

    await linkStoryArcToComicBook(storyArcId, job.data.comicId);
    apiLogger.info(
      `Linked story arc ID: ${storyArcId} to comic ID: ${job.data.comicId}`,
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(
      `Error processing comic story arc ${job.data.storyArcName}: ${errorMessage}`,
    );
    throw error;
  }
}

/**
 * Process comic series group
 */
async function processComicSeriesGroup(
  job: { data: { seriesGroupName: string; comicId: number } },
): Promise<void> {
  try {
    queueLogger.info(
      `Processing comic series group: ${job.data.seriesGroupName} for comic ID: ${job.data.comicId}`,
    );

    const seriesGroupId = await insertComicSeriesGroup(
      job.data.seriesGroupName,
    );
    apiLogger.info(
      `Obtained comic series group ID: ${seriesGroupId} for name: ${job.data.seriesGroupName}`,
    );

    await linkSeriesGroupToComicBook(seriesGroupId, job.data.comicId);
    apiLogger.info(
      `Linked series group ID: ${seriesGroupId} to comic ID: ${job.data.comicId}`,
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(
      `Error processing comic series group ${job.data.seriesGroupName}: ${errorMessage}`,
    );
    throw error;
  }
}

// ==================================================================================
// WORKER CONFIGURATION AND UTILITY FUNCTIONS
// ==================================================================================

/**
 * Helper function to find library ID from file path
 */
const findLibraryIdFromPath = async (
  filePath: string,
): Promise<number | null> => {
  const library = await getLibraryContainingPath(filePath);

  if (library) {
    queueLogger.info(
      `Found library ID ${library.id} ("${library.name}") containing file: ${filePath}`,
    );
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
  { connection: redisConnection },
);

// ==================================================================================
// WORKER EVENT HANDLERS
// ==================================================================================
console.log("Comic Worker started and listening for jobs...");
comicFileWorker.on("completed", (job) => {
  queueLogger.info(`Worker Job ${job.id} has completed`);
});

comicFileWorker.on("failed", (job, err) => {
  queueLogger.error(
    `Worker Job ${job?.id} has failed with error: ${err.message}`,
  );
});

comicFileWorker.on("error", (err) => {
  queueLogger.error(`Worker error: ${err.message}`);
});

// ==================================================================================
// END OF FILE - Comic Worker Implementation Complete
// ==================================================================================
