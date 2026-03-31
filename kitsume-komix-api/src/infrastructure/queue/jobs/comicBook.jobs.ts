
import { comicBookQueue } from "#app/queues.ts";

import { queueLogger } from "#logger/loggers.ts";

import { addComicBookToSeries } from "#db/sqlite/models/comicSeries.model.ts";

import {
	insertComicWriter,
	linkWriterToComicBook,
} from "#db/sqlite/models/comicWriters.model.ts";
import {
	insertComicPenciller,
	linkPencillerToComicBook,
} from "#db/sqlite/models/comicPencillers.model.ts";
import {
	insertComicInker,
	linkInkerToComicBook,
} from "#db/sqlite/models/comicInkers.model.ts";
import {
	insertComicColorist,
	linkColoristToComicBook,
} from "#db/sqlite/models/comicColorists.model.ts";
import {
	insertComicLetterer,
	linkLettererToComicBook,
} from "#db/sqlite/models/comicLetterers.model.ts";
import {
	insertComicEditor,
	linkEditorToComicBook,
} from "#db/sqlite/models/comicEditors.model.ts";
import {
	insertComicCoverArtist,
	linkCoverArtistToComicBook,
} from "#db/sqlite/models/comicCoverArtists.model.ts";
import {
	insertComicPublisher,
	linkPublisherToComicBook,
} from "#db/sqlite/models/comicPublishers.model.ts";
import {
	insertComicImprint,
	linkImprintToComicBook,
} from "#db/sqlite/models/comicImprints.model.ts";
import {
	insertComicGenre,
	linkGenreToComicBook,
} from "#db/sqlite/models/comicGenres.model.ts";
import {
	insertComicCharacter,
	linkCharacterToComicBook,
} from "#db/sqlite/models/comicCharacters.model.ts";
import {
	insertComicTeam,
	linkTeamToComicBook,
} from "#db/sqlite/models/comicTeams.model.ts";
import {
	insertComicLocation,
	linkLocationToComicBook,
} from "#db/sqlite/models/comicLocations.model.ts";
import {
	insertComicStoryArc,
	linkStoryArcToComicBook,
} from "#db/sqlite/models/comicStoryArcs.model.ts";
import {
	insertComicSeriesGroup,
	linkSeriesGroupToComicBook,
} from "#db/sqlite/models/comicSeriesGroups.model.ts";

import { insertComicPage } from "#db/sqlite/models/comicPages.model.ts";
import { insertComicBookCover } from "#db/sqlite/models/comicBookCovers.model.ts";
import { insertComicBookThumbnail } from "#db/sqlite/models/comicBookThumbnails.model.ts";

import { checkIfTheFileShouldBeProcessed, processTheUpdateOrInsertionOfComicBook } from "../actions/processComicFile.ts";

import { extractComicBook } from "#utilities/extract.ts";
import { getComicFileRawDetails } from "#utilities/comic-parser.ts";
import { getFileSize, getImageDimensions } from "#utilities/imageUtils.ts";
import { createImageThumbnail } from "#utilities/image.ts";
import { deleteFolderRecursive } from "#utilities/file.ts";
import { 
	combineMetadataWithParsedFileDetails, 
	retrieveMetadataFromCache, 
	removeMetadataFromCache 
} from "#utilities/metadata.ts";

import type {
	WorkerDataForBuildingComicInsertion,
	WorkerFileCheckResult,
	WorkerFilePathSeriesJob,
	ComicFileDetails,
	MetadataProcessor,
  NewComicBook,
} from "#types/index.ts";
import { StandardizedComicMetadata } from "#interfaces/index.ts";
import { calculateFileHash } from "#utilities/hash.ts";

/**
 * Helper function to compile and combine metadata from different sources for a comic book.
 * - Extracts raw metadata from the comic file name using parsing utilities.
 * - Retrieves standardized metadata from Redis cache if available.
 * @param filePath The path to the comic book file.
 * @param fileHash The hash of the comic book file.
 * @returns Combined metadata for the comic book.
 */
const compileMetadataFromComicBook = async (filePath: string, fileHash: string) => {
	const rawMetadataFromFileName: ComicFileDetails = getComicFileRawDetails(filePath);
	const standardizedMetadata: StandardizedComicMetadata | null = await retrieveMetadataFromCache(filePath);

	if (standardizedMetadata) {
			queueLogger.info(`Retrieved metadata from cache for file: ${filePath}`);
	} else {
			queueLogger.warn(`No cached metadata found for file: ${filePath}, using file details only`);
	}

	return await combineMetadataWithParsedFileDetails(
			{
					filePath: filePath,
					fileHash: fileHash,
			} as WorkerDataForBuildingComicInsertion,
			rawMetadataFromFileName,
			standardizedMetadata || undefined,
	);
}

/**
 * Processes a group of metadata for a comic book.
 * - Inserts each metadata value into the database.
 * - Links the inserted metadata to the comic book.
 * @param comicId The ID of the comic book.
 * @param processor The metadata processor containing values and insertion/linking functions.
 * @returns A promise that resolves when all metadata values have been processed.
 */
const processMetadataGroup = async (
	comicId: number,
	processor: MetadataProcessor,
): Promise<void> => {
	if (!processor.values?.length) {
		return;
	}

	for (const rawValue of processor.values) {
		const value = rawValue?.trim();
		if (!value) {
			continue;
		}

		try {
			const entityId = await processor.insert(value);
			await processor.link(entityId, comicId);
			queueLogger.info(
				`Linked ${processor.label} "${value}" (ID: ${entityId}) to comic ID: ${comicId}`,
			);
		} catch (error) {
			queueLogger.error(
				`Error processing ${processor.label} "${value}" for comic ID ${comicId}: ${error}`,
			);
		}
	}
};


/**
 * Saves or updates a comic book record in the database.
 * - Checks if file should be processed (compares hash)
 * - Retrieves metadata from Redis cache
 * - Combines metadata with parsed file details
 * - Inserts/updates comic book record
 * - Links comic book to series
 * - Queues save-metadata job for follow-up processing
 * 
 * @returns comicId for use by subsequent jobs
 */
export const saveComicBook = async (job: WorkerFilePathSeriesJob): Promise<{ comicId: number }> => {
    const filePath: string = job.filePath;
    const seriesId: number = job.seriesId;

    queueLogger.info(`Saving comic book for file: ${filePath}`);

    const shouldProcessFile: WorkerFileCheckResult = await checkIfTheFileShouldBeProcessed(filePath);
    
    // If comic exists and hash hasn't changed, skip processing
    if (!shouldProcessFile.shouldBeProcessed) {
        queueLogger.info(
            `Skipping processing for ${filePath} - file unchanged`,
        );
        // Return existing comic ID if available from the check
        throw new Error("Comic file unchanged - should not reach this job");
    }

    try {
        const combinedMetadata: NewComicBook = await compileMetadataFromComicBook(filePath, shouldProcessFile.hash);

        const comicId: number = await processTheUpdateOrInsertionOfComicBook(
            shouldProcessFile,
            combinedMetadata,
        );

        queueLogger.info(`Comic book saved with ID: ${comicId} for file: ${filePath}`);

				// TODO: Consider making this a serperate job and add it to the comicbook queue
        // Link comic book to series
        try {
            const linked = await addComicBookToSeries(seriesId, comicId);
            if (linked) {
                queueLogger.info(
                    `Successfully linked comic book ${comicId} to series ${seriesId}`,
                );
            } else {
                queueLogger.warn(
                    `Comic book ${comicId} may already be linked to series ${seriesId}`,
                );
            }
        } catch (linkError) {
            queueLogger.error(
                `Error linking comic book ${comicId} to series ${seriesId}: ${linkError}`,
            );
        }

        // Queue metadata processing job
        await comicBookQueue.add("save-metadata", {
            comicId,
            filePath,
        });

        queueLogger.info(`Queued save-metadata job for comic ID: ${comicId}`);

        // Queue comic image processing job
        await comicBookQueue.add("process-comic-book-images", {
            comicId,
            filePath,
        });

        queueLogger.info(`Queued process-comic-book-images job for comic ID: ${comicId}`);

        return { comicId };
    } catch (error) {
        queueLogger.error(`Error saving comic book for file: ${filePath} - ${error}`);
        throw error;
    }
};


/**
 * Processes and links metadata to a comic book record.
 * - Retrieves metadata from Redis cache
 * - Links metadata to comic book (creates mapping table entry)
 * - Removes metadata from cache after successful processing
 */
export const saveComicBookMetadata = async (job: { comicId: number; filePath: string }): Promise<void> => {
	const comicId: number = job.comicId;
	const filePath: string = job.filePath;

	queueLogger.info(`Processing metadata for comic ID: ${comicId}`);

	try {
		// Retrieve metadata from Redis cache
		const standardizedMetadata: StandardizedComicMetadata | null = await retrieveMetadataFromCache(filePath);

		if (!standardizedMetadata) {
			queueLogger.warn(`No cached metadata found for file: ${filePath}, skipping metadata save`);
			return;
		}

		queueLogger.info(`Retrieved metadata from cache for comic ID: ${comicId}`);

		const processors: MetadataProcessor[] = [
			{
				label: "writer",
				values: standardizedMetadata.writers,
				insert: insertComicWriter,
				link: linkWriterToComicBook,
			},
			{
				label: "penciller",
				values: standardizedMetadata.pencillers,
				insert: insertComicPenciller,
				link: linkPencillerToComicBook,
			},
			{
				label: "inker",
				values: standardizedMetadata.inkers,
				insert: insertComicInker,
				link: linkInkerToComicBook,
			},
			{
				label: "colorist",
				values: standardizedMetadata.colorists,
				insert: insertComicColorist,
				link: linkColoristToComicBook,
			},
			{
				label: "letterer",
				values: standardizedMetadata.letterers,
				insert: insertComicLetterer,
				link: linkLettererToComicBook,
			},
			{
				label: "editor",
				values: standardizedMetadata.editors,
				insert: insertComicEditor,
				link: linkEditorToComicBook,
			},
			{
				label: "cover artist",
				values: standardizedMetadata.coverArtists,
				insert: insertComicCoverArtist,
				link: linkCoverArtistToComicBook,
			},
			{
				label: "publisher",
				values: standardizedMetadata.publisher,
				insert: insertComicPublisher,
				link: linkPublisherToComicBook,
			},
			{
				label: "imprint",
				values: standardizedMetadata.imprint,
				insert: insertComicImprint,
				link: linkImprintToComicBook,
			},
			{
				label: "genre",
				values: standardizedMetadata.genres,
				insert: insertComicGenre,
				link: linkGenreToComicBook,
			},
			{
				label: "character",
				values: standardizedMetadata.characters,
				insert: insertComicCharacter,
				link: linkCharacterToComicBook,
			},
			{
				label: "team",
				values: standardizedMetadata.teams,
				insert: insertComicTeam,
				link: linkTeamToComicBook,
			},
			{
				label: "location",
				values: standardizedMetadata.locations,
				insert: insertComicLocation,
				link: linkLocationToComicBook,
			},
			{
				label: "story arc",
				values: standardizedMetadata.storyArcs,
				insert: insertComicStoryArc,
				link: linkStoryArcToComicBook,
			},
			{
				label: "series group",
				values: standardizedMetadata.seriesGroups,
				insert: insertComicSeriesGroup,
				link: linkSeriesGroupToComicBook,
			},
		];

		for (const processor of processors) {
			await processMetadataGroup(comicId, processor);
		}

		queueLogger.info(`Successfully processed metadata for comic ID: ${comicId}`);

		// Remove metadata from cache after successful processing
		const removed = await removeMetadataFromCache(filePath);
		if (removed) {
			queueLogger.info(`Removed metadata from cache for file: ${filePath}`);
		} else {
			queueLogger.warn(`Failed to remove metadata from cache for file: ${filePath}`);
		}
	} catch (error) {
		queueLogger.error(`Error processing metadata for comic ID: ${comicId} - ${error}`);
		throw error;
	}
};

/**
 * Processes comic images by extracting pages, storing page metadata,
 * creating cover records, and generating thumbnails.
 */
export const processComicBookImages = async (job: { comicId: number; filePath: string }): Promise<void> => {
	const comicId: number = job.comicId;
	const filePath: string = job.filePath;

	try {
		queueLogger.info(
			`Processing comic images for file: ${filePath} and comic ID: ${comicId}`,
		);

		const standardizedMetadata = await retrieveMetadataFromCache(filePath);
		const metadataPages = standardizedMetadata?.pages || [];

		const extractionResult = await extractComicBook(filePath);
		if (!extractionResult.success) {
			throw new Error(`Failed to extract images from comic file: ${filePath}`);
		}

		const {
			pages: imagePaths,
			extractedPath,
		} = extractionResult;

		const coverPages: Array<{ pageId: number; imagePath: string; pageNumber: number }> = [];

		for (let i = 0; i < imagePaths.length; i++) {
			const imagePath = imagePaths[i];
			const pageNumber = i + 1;
			const imageHash = await calculateFileHash(imagePath);
			const relativePath = imagePath.split("/").pop() || imagePath;

			const metadataPage = metadataPages.find((page) => Number.parseInt(page.image) === pageNumber);

			let fileSize: number;
			let imageWidth: number | null = null;
			let imageHeight: number | null = null;

			if (metadataPage?.size && metadataPage?.width && metadataPage?.height) {
				fileSize = metadataPage.size;
				imageWidth = metadataPage.width;
				imageHeight = metadataPage.height;
			} else {
				fileSize = await getFileSize(imagePath);
				const dimensions = await getImageDimensions(imagePath);
				imageWidth = dimensions?.width || null;
				imageHeight = dimensions?.height || null;
			}

			const pageId = await insertComicPage(
				comicId,
				relativePath,
				pageNumber,
				imageHash,
				fileSize,
				metadataPage?.type || (pageNumber === 1 ? "Cover" : "Story"),
				metadataPage?.doublePage ? 1 : 0,
				imageWidth,
				imageHeight,
			);

			const isFirstPage = pageNumber === 1;
			const isFrontCoverFromMetadata = metadataPage?.type === "FrontCover";
			if (isFirstPage || isFrontCoverFromMetadata) {
				coverPages.push({ pageId, imagePath, pageNumber });
			}
		}

		for (const coverPage of coverPages) {
			const coverRelativePath = coverPage.imagePath.split("/").pop() || coverPage.imagePath;
			const coverId = await insertComicBookCover(coverPage.pageId, coverRelativePath);

			const thumbnail = await createImageThumbnail(coverPage.imagePath, {
				width: 300,
				height: 450,
			});

			if (thumbnail.success && thumbnail.thumbnailPath) {
				await insertComicBookThumbnail(comicId, coverId, thumbnail.thumbnailPath);
			} else {
				queueLogger.error(
					`Failed to create thumbnail for cover image: ${coverPage.imagePath}. Error: ${thumbnail.error || "Unknown error"}`,
				);
			}
		}

		if (extractedPath) {
			await deleteFolderRecursive(extractedPath);
		}
	} catch (error) {
		queueLogger.error(`Error processing comic images for file: ${filePath} - ${error}`);
		throw error;
	}
};