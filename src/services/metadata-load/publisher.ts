import logger from "../../utilities/logger.ts";
import type { ComicInfo } from "npm:comic-metadata-tool/dist/src/interfaces/comicInfo.d.ts";

import { splitProperty } from "../../helpers/propertyParsing.ts";

import { insertComicPublisherQuery } from "../../database/queries/comicPublishers.ts";
import { insertComicMetadataPublisherQuery } from "../../database/queries/comicMetadataPublishers.ts";

/**
 * Parses and loads publishers from ComicInfo XML metadata.
 * @param metadata The ComicInfo metadata object.
 * @param comicMetadataId The ID of the comic metadata.
 * @returns void
 */
export const parseAndLoadPublishersFromComicInfoXmlMetadata = (
	metadata: ComicInfo,
	comicMetadataId: number
): void => {
	if (!metadata) {
		logger.error('ComicsParser... No metadata or comicInfoXml found');
		return;
	}

	const publisherRaw = metadata.Publisher ?? "";
	const publishers = splitProperty(publisherRaw);

	if (publishers.length > 0) {
		logger.info(`ComicsParser... Inserting publishers for ${publishers.join(", ")}`);
		for (const publisher of publishers) {
			logger.info(`ComicsParser... Inserting publisher for ${publisher}`);
			let publisherId = null;

			try {
				publisherId = insertComicPublisherQuery(publisher);
				logger.info(`ComicsParser... Inserted publisher for ${publisher} with ID: ${publisherId}`);
			} catch (error) {
				logger.error(`ComicsParser... Error inserting publisher for ${publisher}: ${error}`);
			}

			if (!publisherId) {
				logger.error(
					`ComicsParser... Failed to insert publisher for ${publisher}, cannot insert comic metadata publisher.`
				);
				continue;
			}

			try {
				insertComicMetadataPublisherQuery(comicMetadataId, publisherId);
			} catch (error) {
				logger.error(`ComicsParser... Error inserting comic metadata publisher for ${comicMetadataId}, ${publisherId}: ${error}`);
			}
		}
	}
};