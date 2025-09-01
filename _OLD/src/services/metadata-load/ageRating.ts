import logger from "../../utilities/logger.ts";
import type { ComicInfo } from "npm:comic-metadata-tool/dist/src/interfaces/comicInfo.d.ts";

import { splitProperty } from "../../helpers/propertyParsing.ts";

import { insertComicAgeRatingQuery } from "../../database/queries/comicAgeRatings.ts";
import { insertComicMetadataAgeRatingQuery } from "../../database/queries/comicMetadataAgeRatings.ts";

/**
 * Parses and loads age ratings from ComicInfo XML metadata.
 * @param metadata The ComicInfo metadata object.
 * @param comicMetadataId The ID of the comic metadata.
 * @returns void
 */
export const parseAndLoadAgeRatingsFromComicInfoXmlMetadata = (
	metadata: ComicInfo,
	comicMetadataId: number
): void => {
	if (!metadata) {
		logger.error('ComicsParser', 'No metadata or comicInfoXml found');
		return;
	}

	const ageRatingRaw = metadata.AgeRating ?? "";
	const ageRatings = splitProperty(ageRatingRaw);

	if (ageRatings.length > 0) {
		logger.info(`ComicsParser... Inserting age ratings for ${ageRatings.join(", ")}`);
		for (const ageRating of ageRatings) {
			logger.info(`ComicsParser... Inserting age rating for ${ageRating}`);
			let ageRatingId = null;

			try {
				ageRatingId = insertComicAgeRatingQuery(ageRating);
				logger.info(`ComicsParser... Inserted age rating for ${ageRating} with ID: ${ageRatingId}`);
			} catch (error) {
				logger.error(`ComicsParser... Error inserting age rating for ${ageRating}: ${error}`);
			}

			if (!ageRatingId) {
				logger.error(
					`ComicsParser... Failed to insert age rating for ${ageRating}, cannot insert comic metadata age rating.`
				);
				continue;
			}

			try {
				insertComicMetadataAgeRatingQuery(comicMetadataId, ageRatingId);
			} catch (error) {
				logger.error(`ComicsParser... Error inserting comic metadata age rating for ${comicMetadataId}, ${ageRatingId}: ${error}`);
			}
		}
	}
};