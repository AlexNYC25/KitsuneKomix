import logger from "../../utilities/logger.ts";
import type { ComicInfo } from "npm:comic-metadata-tool/dist/src/interfaces/comicInfo.d.ts";

import { splitProperty } from "../../helpers/propertyParsing.ts";

import { insertComicLettererQuery } from "../../database/queries/comicLetterers.ts";
import { insertComicMetadataLettererQuery } from "../../database/queries/comicMetadataLetterers.ts";

/**
 * Parses and loads letterers from ComicInfo XML metadata.
 * @param metadata The ComicInfo metadata object.
 * @param comicMetadataId The ID of the comic metadata.
 * @returns void
 */
export const parseAndLoadLetterersFromComicInfoXmlMetadata = (
	metadata: ComicInfo,
	comicMetadataId: number
): void => {
	if (!metadata) {
		logger.error(`ComicsParser... No metadata or comicInfoXml found`);
		return;
	}

	const lettererRaw = metadata.Letterer ?? "";
	const letterers = splitProperty(lettererRaw);

	if (letterers.length > 0) {
		logger.info(`ComicsParser... Inserting letterers for ${letterers.join(", ")}`);
		for (const letterer of letterers) {
			logger.info(`ComicsParser... Inserting letterer for ${letterer}`);
			let lettererId = null;

			try {
				lettererId = insertComicLettererQuery(letterer);
				logger.info(`ComicsParser... Inserted letterer for ${letterer} with ID: ${lettererId}`);
			} catch (error) {
				logger.error(`ComicsParser... Error inserting letterer for ${letterer}: ${error}`);
			}

			if (!lettererId) {
				logger.error(
					`ComicsParser... Failed to insert letterer for ${letterer}, cannot insert comic metadata letterer.`
				);
				continue;
			}

			try {
				insertComicMetadataLettererQuery(comicMetadataId, lettererId);
			} catch (error) {
				logger.error(`ComicsParser... Error inserting comic metadata letterer for ${comicMetadataId}, ${lettererId}: ${error}`);
			}
		}
	}
};