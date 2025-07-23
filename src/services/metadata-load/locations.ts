import logger from "../../utilities/logger.ts";
import type { ComicInfo } from "npm:comic-metadata-tool/dist/src/interfaces/comicInfo.d.ts";

import { splitProperty } from "../../helpers/propertyParsing.ts";

import { insertComicLocationQuery } from "../../database/queries/comicLocations.ts";
import { insertComicMetadataLocationQuery } from "../../database/queries/comicMetadataLocations.ts";

/**
 * Parses and loads locations from ComicInfo XML metadata.
 * @param metadata The ComicInfo metadata object.
 * @param comicMetadataId The ID of the comic metadata.
 * @returns void
 */
export const parseAndLoadLocationsFromComicInfoXmlMetadata = (
	metadata: ComicInfo,
	comicMetadataId: number
): void => {
	if (!metadata) {
		logger.error(`ComicsParser... No metadata or comicInfoXml found`);
		return;
	}

	const locationRaw = metadata.Locations ?? "";
	const locations = splitProperty(locationRaw);

	if (locations.length > 0) {
		logger.info(`ComicsParser... Inserting locations for ${locations.join(", ")}`);
		for (const location of locations) {
			logger.info(`ComicsParser... Inserting location for ${location}`);
			let locationId = null;

			try {
				locationId = insertComicLocationQuery(location);
				logger.info(`ComicsParser... Inserted location for ${location} with ID: ${locationId}`);
			} catch (error) {
				logger.error(`ComicsParser... Error inserting location for ${location}: ${error}`);
			}

			if (!locationId) {
				logger.error(
					`ComicsParser... Failed to insert location for ${location}, cannot insert comic metadata location.`
				);
				continue;
			}

			try {
				insertComicMetadataLocationQuery(comicMetadataId, locationId);
			} catch (error) {
				logger.error(`ComicsParser... Error inserting comic metadata location for ${comicMetadataId}, ${locationId}: ${error}`);
			}
		}
	}
};