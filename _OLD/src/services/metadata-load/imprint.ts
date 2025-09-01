import logger from "../../utilities/logger.ts";
import type { ComicInfo } from "npm:comic-metadata-tool/dist/src/interfaces/comicInfo.d.ts";

import { splitProperty } from "../../helpers/propertyParsing.ts";

import { insertComicImprintQuery } from "../../database/queries/comicImprints.ts";
import { insertComicMetadataImprintQuery } from "../../database/queries/comicMetadataImprints.ts";

/**
 * Parses and loads imprints from ComicInfo XML metadata.
 * @param metadata The ComicInfo metadata object.
 * @param comicMetadataId The ID of the comic metadata.
 * @returns void
 */
export const parseAndLoadImprintsFromComicInfoXmlMetadata = (
	metadata: ComicInfo,
	comicMetadataId: number
): void => {
	if (!metadata) {
		logger.error(`ComicsParser... No metadata or comicInfoXml found`);
		return;
	}

	const imprintRaw = metadata.Imprint ?? "";
	const imprints = splitProperty(imprintRaw);

	if (imprints.length > 0) {
		logger.info(`ComicsParser... Inserting imprints for ${imprints.join(", ")}`);
		for (const imprint of imprints) {
			logger.info(`ComicsParser... Inserting imprint for ${imprint}`);
			let imprintId = null;

			try {
				imprintId = insertComicImprintQuery(imprint);
				logger.info(`ComicsParser... Inserted imprint for ${imprint} with ID: ${imprintId}`);
			} catch (error) {
				logger.error(`ComicsParser... Error inserting imprint for ${imprint}: ${error}`);
			}

			if (!imprintId) {
				logger.error(
					`ComicsParser... Failed to insert imprint for ${imprint}, cannot insert comic metadata imprint.`
				);
				continue;
			}

			try {
				insertComicMetadataImprintQuery(comicMetadataId, imprintId);
			} catch (error) {
				logger.error(`ComicsParser... Error inserting comic metadata imprint for ${comicMetadataId}, ${imprintId}: ${error}`);
			}
		}
	}
};