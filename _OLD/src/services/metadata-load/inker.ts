import logger from "../../utilities/logger.ts";
import type { ComicInfo } from "npm:comic-metadata-tool/dist/src/interfaces/comicInfo.d.ts";

import { splitProperty } from "../../helpers/propertyParsing.ts";

import { insertComicInkerQuery } from "../../database/queries/comicInkers.ts";
import { insertComicMetadataInkerQuery } from "../../database/queries/comicMetadataInkers.ts";

/**
 * Parses and loads inkers from ComicInfo XML metadata.
 * @param metadata The ComicInfo metadata object.
 * @param comicMetadataId The ID of the comic metadata.
 * @returns void
 */
export const parseAndLoadInkersFromComicInfoXmlMetadata = (
	metadata: ComicInfo,
	comicMetadataId: number
): void => {
	if (!metadata) {
		logger.error(`ComicsParser... No metadata or comicInfoXml found`);
		return;
	}

	const inkerRaw = metadata.Inker ?? "";
	const inkers = splitProperty(inkerRaw);

	if (inkers.length > 0) {
		logger.info(`ComicsParser... Inserting inkers for ${inkers.join(", ")}`);
		for (const inker of inkers) {
			logger.info(`ComicsParser... Inserting inker for ${inker}`);
			let inkerId = null;

			try {
				inkerId = insertComicInkerQuery(inker);
				logger.info(`ComicsParser... Inserted inker for ${inker} with ID: ${inkerId}`);
			} catch (error) {
				logger.error(`ComicsParser... Error inserting inker for ${inker}: ${error}`);
			}

			if (!inkerId) {
				logger.error(
					`ComicsParser... Failed to insert inker for ${inker}, cannot insert comic metadata inker.`
				);
				continue;
			}

			try {
				insertComicMetadataInkerQuery(comicMetadataId, inkerId);
			} catch (error) {
				logger.error(`ComicsParser... Error inserting comic metadata inker for ${comicMetadataId}, ${inkerId}: ${error}`);
			}
		}
	}
};