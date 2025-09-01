import logger from "../../utilities/logger.ts";
import type { ComicInfo } from "npm:comic-metadata-tool/dist/src/interfaces/comicInfo.d.ts";

import { splitProperty } from "../../helpers/propertyParsing.ts";

import { insertComicWriterQuery } from "../../database/queries/comicWriters.ts";
import { insertComicMetadataWriterQuery } from "../../database/queries/comicMetadataWriters.ts";

/**
 * Parses and loads writers from ComicInfo XML metadata.
 * @param metadata The ComicInfo metadata object.
 * @param comicMetadataId The ID of the comic metadata.
 * @returns void
 */
export const parseAndLoadWritersFromComicInfoXmlMetadata = (
	metadata: ComicInfo,
	comicMetadataId: number
): void => {
	if (!metadata) {
		logger.error('ComicsParser... No metadata or comicInfoXml found');
		return;
	}

	const writerRaw = metadata.Writer ?? "";
	const writers = splitProperty(writerRaw);

	if (writers.length > 0) {
		logger.info(`ComicsParser... Inserting writers for ${writers.join(", ")}`);
		for (const writer of writers) {
			logger.info(`ComicsParser... Inserting writer for ${writer}`);
			let writerId = null;

			try {
				writerId = insertComicWriterQuery(writer);
				logger.info(`ComicsParser... Inserted writer for ${writer} with ID: ${writerId}`);
			} catch (error) {
				logger.error(`ComicsParser... Error inserting writer for ${writer}: ${error}`);
			}

			if (!writerId) {
				logger.error(
					`ComicsParser... Failed to insert writer for ${writer}, cannot insert comic metadata writer.`
				);
				continue;
			}

			try {
				insertComicMetadataWriterQuery(comicMetadataId, writerId);
			} catch (error) {
				logger.error(
					`ComicsParser... Error inserting comic metadata writer for ${comicMetadataId}, ${writerId}: ${error}`
				);
			}
		}
	}
};