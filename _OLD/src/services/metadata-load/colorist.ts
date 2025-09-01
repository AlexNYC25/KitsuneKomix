import logger from "../../utilities/logger.ts";
import type { ComicInfo } from "npm:comic-metadata-tool/dist/src/interfaces/comicInfo.d.ts";

import { splitProperty } from "../../helpers/propertyParsing.ts";

import { insertComicColoristQuery } from "../../database/queries/comicColorists.ts";
import { insertComicMetadataColoristQuery } from "../../database/queries/comicMetadataColorists.ts";

/**
 * Parses and loads colorists from ComicInfo XML metadata.
 * @param metadata The ComicInfo metadata object.
 * @param comicMetadataId The ID of the comic metadata.
 * @returns void
 */
export const parseAndLoadColoristsFromComicInfoXmlMetadata = (
	metadata: ComicInfo,
	comicMetadataId: number
): void => {
	if (!metadata) {
		logger.error('ComicsParser', 'No metadata or comicInfoXml found');
		return;
	}

	const coloristRaw = metadata.Colorist ?? "";
	const colorists = splitProperty(coloristRaw);

	if (colorists.length > 0) {
		logger.info(`ComicsParser... Inserting colorists for ${colorists.join(", ")}`);
		for (const colorist of colorists) {
			logger.info(`ComicsParser... Inserting colorist for ${colorist}`);
			let coloristId = null;

			try {
				coloristId = insertComicColoristQuery(colorist);
				logger.info(`ComicsParser... Inserted colorist for ${colorist} with ID: ${coloristId}`);
			} catch (error) {
				logger.error(`ComicsParser... Error inserting colorist for ${colorist}: ${error}`);
			}

			if (!coloristId) {
				logger.error(
					`ComicsParser... Failed to insert colorist for ${colorist}, cannot insert comic metadata colorist.`
				);
				continue;
			}

			try {
				insertComicMetadataColoristQuery(comicMetadataId, coloristId);
			} catch (error) {
				logger.error(`ComicsParser... Error inserting comic metadata colorist for ${comicMetadataId}, ${coloristId}: ${error}`);
			}
		}
	}
};