import logger from "../../utilities/logger.ts";
import type { ComicInfo } from "npm:comic-metadata-tool/dist/src/interfaces/comicInfo.d.ts";

import { ComicFileProperties } from "../../interfaces/comic-file-properties.interface.ts";
import { ComicFolderProperties } from "../../interfaces/comic-folder-properties.interface.ts";
import { ComicMetadataInsert } from "../../interfaces/comic-metadata.interface.ts";

import { insertComicMetadataQuery } from "../../database/queries/comicMetadata.ts";

/**
 * Parses and loads comic metadata from the ComicInfo XML metadata with other parsed details and inserts it into the database.
 * @param metadata - The ComicInfo metadata object parsed from the XML file.
 * @param parsedComicDetails - The parsed comic file properties.
 * @param parsedFolderDetails - The parsed folder properties.
 * @returns The ID of the inserted comic metadata or null if insertion failed.
 */
export const parseAndLoadComicMetadataFromComicInfoXmlMetadata = (
	metadata: ComicInfo,
	parsedComicDetails: ComicFileProperties,
	parsedFolderDetails: ComicFolderProperties,
): number | null => {
	if (!metadata) {
		logger.error('ComicsParser... No metadata or comicInfoXml found');
		return null;
	}

	let comicMetadataId = null;
	const comicMetadataPayload: ComicMetadataInsert = {
		id: null, // This will be set after inserting the metadata
		title: metadata.Title || null,
		series:
			metadata.Series ||
			parsedComicDetails.seriesName ||
			parsedFolderDetails.seriesName,
		number:
			metadata.Number ||
			parsedComicDetails.issueNumber ||
			null,
		count: metadata.Count || null,
		volume:
			metadata.Volume?.toString() ||
			parsedComicDetails.volumeNumber ||
			null,
		alternateSeries: metadata.AlternateSeries || null,
		alternateNumber: metadata.AlternateNumber || null,
		alternateVolume: null,
		summary: metadata.Summary || null,
		notes: metadata.Notes || null,
		year: parseInt(
			String(
				metadata.Year ||
				parsedComicDetails.year ||
				parsedFolderDetails.seriesYear ||
				null
			),
			10
		),
		month: parseInt(String(metadata.Month || null), 10),
		day: parseInt(String(metadata.Day || null), 10),
		website: metadata.Web || null,
		page_count: parseInt(String(metadata.PageCount || null), 10),
		language: metadata.LanguageISO || null,
		format: metadata.Format || null,
		blackAndWhite:
			metadata.BlackAndWhite === "Yes",
		manga: metadata.Manga === "Yes" || metadata.Manga === "YesAndRightToLeft" || null,
		mangaDirection: metadata.Manga === "YesAndRightToLeft" ? "RightToLeft" : null,
		scanInfo: metadata.ScanInformation || null,
		storyArcId: null, // TODO: Handle story arc ID if available
		communityRating: metadata.CommunityRating || null,
		mainCharacter: metadata.MainCharacterOrTeam || null,
		review: metadata.Review || null,
		gtin: null
	};

	try {
		comicMetadataId = insertComicMetadataQuery(comicMetadataPayload);
		logger.info(`ComicsParser... Inserted comic metadata for ${comicMetadataPayload.title} with ID: ${comicMetadataId}`);
	} catch (error) {
		logger.error(`ComicsParser... Error inserting comic metadata for ${comicMetadataPayload.title}: ${error}`);
	}

	return comicMetadataId;
}

/**
 * Parses and loads comic series metadata from the ComicInfo XML metadata with other parsed details and inserts it into the database.
 * @param metadata - The ComicInfo metadata object parsed from the XML file.
 * @param parentDir - The parent directory path where the series is located.
 * @param parsedComicDetails - The parsed comic file properties.
 * @param parsedFolderDetails - The parsed folder properties.
 * @returns The ID of the inserted comic series or null if insertion failed.
 */
export const parseAndLoadComicMetadataFromFileName = (
	parsedComicDetails: ComicFileProperties,
	parsedFolderDetails: ComicFolderProperties,
): number | null => {
	// insert the comic book metadata record into the database using the basic info we parsed from the file name
	let comicMetadataId = null;
	const comicMetadataPayload: ComicMetadataInsert = {
		id: null, // This will be set after inserting the metadata
		title: null,
		series: parsedComicDetails.seriesName || parsedFolderDetails.seriesName,
		number: parsedComicDetails.issueNumber || null,
		count: null,
		volume: parsedComicDetails.volumeNumber || null,
		alternateSeries: null,
		alternateNumber: null,
		alternateVolume: null,
		summary: null,
		notes: null,
		year: parseInt(String(parsedComicDetails.year || parsedFolderDetails.seriesYear || null), 10),
		month: null,
		day: null,
		website: null,
		page_count: null,
		language: null,
		format: null,
		blackAndWhite: null,
		manga: null,
		mangaDirection: null,
		scanInfo: null,
		storyArcId: null,
		communityRating: null,
		mainCharacter: null,
		review: null,
		gtin: null
	};

	try {
		logger.info(`ComicsParser task... Inserted comic metadata for ${comicMetadataPayload.series} - ${comicMetadataPayload.number}`);
		comicMetadataId = insertComicMetadataQuery(comicMetadataPayload);
	} catch (error) {
		logger.error(`ComicsParser task... Error inserting comic metadata for ${comicMetadataPayload.title}: ${error}`);
	}

	return comicMetadataId;
}