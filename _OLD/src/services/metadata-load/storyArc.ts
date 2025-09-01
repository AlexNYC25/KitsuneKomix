import logger from "../../utilities/logger.ts";
import type { ComicInfo } from "npm:comic-metadata-tool/dist/src/interfaces/comicInfo.d.ts";

import { splitProperty } from "../../helpers/propertyParsing.ts";

import { insertComicStoryArcQuery } from "../../database/queries/comicStoryArcs.ts";
import { insertComicMetadataStoryArcQuery } from "../../database/queries/comicMetadataStoryArcs.ts";

/**
 * Parses and loads story arcs from ComicInfo XML metadata.
 * @param metadata The ComicInfo metadata object.
 * @param comicMetadataId The ID of the comic metadata.
 * @returns void
 */
export const parseAndLoadStoryArcsFromComicInfoXmlMetadata = (
	metadata: ComicInfo,
	comicMetadataId: number
): void => {
	if (!metadata) {
		logger.error('ComicsParser... No metadata or comicInfoXml found');
		return;
	}

	const storyArcRaw = metadata.StoryArc ?? "";
	const storyArcs = splitProperty(storyArcRaw);

	if (storyArcs.length > 0) {
		logger.info(`ComicsParser... Inserting story arcs for ${storyArcs.join(", ")}`);
		for (const arc of storyArcs) {
			logger.info(`ComicsParser... Inserting story arc for ${arc}`);
			let storyArcId = null;

			try {
				storyArcId = insertComicStoryArcQuery(arc);
				logger.info(`ComicsParser... Inserted story arc for ${arc} with ID: ${storyArcId}`);
			} catch (error) {
				logger.error(`ComicsParser... Error inserting story arc for ${arc}: ${error}`);
			}

			if (!storyArcId) {
				logger.error(
					`ComicsParser... Failed to insert story arc for ${arc}, cannot insert comic metadata story arc.`
				);
				continue;
			}

			try {
				insertComicMetadataStoryArcQuery(comicMetadataId, storyArcId);
			} catch (error) {
				logger.error(
					`ComicsParser... Error inserting comic metadata story arc for ${comicMetadataId}, ${storyArcId}: ${error}`
				);
			}
		}
	}
};