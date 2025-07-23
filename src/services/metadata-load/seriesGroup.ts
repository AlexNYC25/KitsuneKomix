import logger from "../../utilities/logger.ts";
import type { ComicInfo } from "npm:comic-metadata-tool/dist/src/interfaces/comicInfo.d.ts";

import { splitProperty } from "../../helpers/propertyParsing.ts";

import { insertComicSeriesGroupQuery } from "../../database/queries/comicSeriesGroups.ts";
import { insertComicMetadataSeriesGroupQuery } from "../../database/queries/comicMetadataSeriesGroups.ts";

/**
 * Parses and loads series groups from ComicInfo XML metadata.
 * @param metadata The ComicInfo metadata object.
 * @param comicMetadataId The ID of the comic metadata.
 * @returns void
 */
export const parseAndLoadSeriesGroupsFromComicInfoXmlMetadata = (
	metadata: ComicInfo,
	comicMetadataId: number
): void => {
	if (!metadata) {
		logger.error('ComicsParser... No metadata or comicInfoXml found');
		return;
	}

	// if the comicSeriesGroupPayload.name is not null, and when we break apart the name propery by ',' if the length is greater than 1 then we can insert the series group into the database
	const seriesGroupRaw = metadata.SeriesGroup ?? ""
	const seriesGroups = splitProperty(seriesGroupRaw)

	if (seriesGroups.length > 0) {
		logger.info(`ComicsParser... Inserting series groups for ${seriesGroups.join(", ")}`)
		for (const group of seriesGroups) {
			logger.info(`ComicsParser... Inserting series group for ${group}`)
			let seriesGroupId = null

			try {
				seriesGroupId = insertComicSeriesGroupQuery(group)
				logger.info(`ComicsParser... Inserted series group for ${group} with ID: ${seriesGroupId}`)
			} catch (error) {
				logger.error(`ComicsParser... Error inserting series group for ${group}: ${error}`)
			}

			if (!seriesGroupId) {
				logger.error(
					`ComicsParser... Failed to insert series group for ${group}, cannot insert comic metadata series group.`
				)
				continue
			}

			try {
				insertComicMetadataSeriesGroupQuery(comicMetadataId, seriesGroupId)
			} catch (error) {
				logger.error(
					`ComicsParser... Error inserting comic metadata series group for ${comicMetadataId}, ${seriesGroupId}: ${error}`
				)
			}
		}
	}
}