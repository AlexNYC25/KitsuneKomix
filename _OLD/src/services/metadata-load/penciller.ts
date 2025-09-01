import logger from "../../utilities/logger.ts";
import type { ComicInfo } from "npm:comic-metadata-tool/dist/src/interfaces/comicInfo.d.ts";

import { splitProperty } from "../../helpers/propertyParsing.ts";

import { insertComicPencillerQuery } from "../../database/queries/comicPencillers.ts";
import { insertComicMetadataPencillerQuery } from "../../database/queries/comicMetadataPencillers.ts";

/**
 * Parses and loads pencillers from ComicInfo XML metadata.
 * @param metadata The ComicInfo metadata object.
 * @param comicMetadataId The ID of the comic metadata.
 * @returns void
 */
export const parseAndLoadPencillersFromComicInfoXmlMetadata = (
	metadata: ComicInfo,
	comicMetadataId: number
): void => {
	if (!metadata) {
		logger.error('ComicsParser... No metadata or comicInfoXml found');
		return;
	}

	const pencillerRaw = metadata.Penciller ?? "";
	const pencillers = splitProperty(pencillerRaw);

	if (pencillers.length > 0) {
		logger.info(`ComicsParser... Inserting pencillers for ${pencillers.join(", ")}`);
		for (const penciller of pencillers) {
			logger.info(`ComicsParser... Inserting penciller for ${penciller}`);
			let pencillerId = null;

			try {
				pencillerId = insertComicPencillerQuery(penciller);
				logger.info(`ComicsParser... Inserted penciller for ${penciller} with ID: ${pencillerId}`);
			} catch (error) {
				logger.error(`ComicsParser... Error inserting penciller for ${penciller}: ${error}`);
			}

			if (!pencillerId) {
				logger.error(
					`ComicsParser... Failed to insert penciller for ${penciller}, cannot insert comic metadata penciller.`
				);
				continue;
			}

			try {
				insertComicMetadataPencillerQuery(comicMetadataId, pencillerId);
			} catch (error) {
				logger.error(
					`ComicsParser... Error inserting comic metadata penciller for ${comicMetadataId}, ${pencillerId}: ${error}`
				);
			}
		}
	}
};