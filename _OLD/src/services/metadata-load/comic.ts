import logger from "../../utilities/logger.ts";
import type { ComicInfo } from "npm:comic-metadata-tool/dist/src/interfaces/comicInfo.d.ts";

import { ComicFileProperties } from "../../interfaces/comic-file-properties.interface.ts";
import { ComicBookInsert } from "../../interfaces/comic-book.interface.ts";

import { insertComicBookQuery } from "../../database/queries/comicBooks.ts";

/**
 * Parses and loads comic book metadata from the ComicInfo XML metadata with other parsed details and inserts it into the database.
 * @param metadata - The ComicInfo metadata object parsed from the XML file.
 * @param file - The file path of the comic book.
 * @param comicFileHash - The hash of the comic book file.
 * @param comicMetadataId - The ID of the comic metadata.
 * @param comicSeriesId - The ID of the comic series.
 * @returns The ID of the inserted comic book or null if insertion failed.
 */
export const parseAndLoadComicBookFromComicInfoXmlMetadata = (
	metadata: ComicInfo,
	file: string,
	comicFileHash: string,
	comicMetadataId: number,
	comicSeriesId: number
): number | null => {
	if (!metadata) {
		logger.error(`ComicsParser... No metadata or comicInfoXml found`);
		return null;
	}

	let comicBookId = null;
	const comicPayload: ComicBookInsert = {
		title: metadata.Title || null,
		file_name: file, // TODO: Fix and differnetiate between file name and file path
		file_hash: comicFileHash,
		file_path: file,
		timestamp: new Date(),
		metadata_id: comicMetadataId,
		series_id: comicSeriesId
	};

	try {
		comicBookId = insertComicBookQuery(comicPayload);
		logger.info(`ComicsParser... Inserting comic book metadata for ${comicPayload.title}`);
	} catch (error) {
		logger.error(`ComicsParser... Error inserting comic book metadata for ${comicPayload.title}: ${error}`);
	}

	if (!comicBookId) {
		logger.error(`ComicsParser... Failed to insert or upsert comic book for ${comicPayload.title}`);
		return null;
	}

	return comicBookId;
}

/**
 * 
 */
export const parseAndLoadComicBookFromFileName = (
	file: string,
	comicFileHash: string,
	parsedComicDetails: ComicFileProperties,
	comicMetadataId: number,
	comicSeriesId: number,
): number | null => {
	const comicPayload: ComicBookInsert = {
		title: null,
		file_name: file,
		file_hash: comicFileHash,
		file_path: file,
		timestamp: new Date(),
		metadata_id: comicMetadataId, // This will be set after inserting the metadata
		series_id: comicSeriesId // This will be set after inserting the series
	};

	let comicId = null;
	if (!comicSeriesId) {
		logger.error(`ComicsParser task... Failed to insert series metadata for ${parsedComicDetails.seriesName}, cannot insert comic book.`);
		return null;
	}

	if (!comicMetadataId) {
		logger.error(`ComicsParser task... Failed to insert comic metadata for ${parsedComicDetails.seriesName} - ${parsedComicDetails.issueNumber}, cannot insert comic book.`);
		return null;
	}

	try {
		comicId = insertComicBookQuery(comicPayload);
		logger.info(`ComicsParser task... Inserted comic book for ${parsedComicDetails.seriesName} - ${parsedComicDetails.issueNumber} with ID: ${comicId}`);
	} catch (error) {
		logger.error(`ComicsParser task... Error inserting comic book for ${parsedComicDetails.seriesName} - ${parsedComicDetails.issueNumber}: ${error}`);
	}

	return comicId;
}