import logger from "../../utilities/logger.ts";
import type { ComicInfo } from "npm:comic-metadata-tool/dist/src/interfaces/comicInfo.d.ts";

import { splitProperty } from "../../helpers/propertyParsing.ts";

import { insertComicTeamQuery } from "../../database/queries/comicTeams.ts";
import { insertComicMetadataTeamQuery } from "../../database/queries/comicMetadataTeams.ts";

/**
 * Parses and loads teams from ComicInfo XML metadata.
 * @param metadata The ComicInfo metadata object.
 * @param comicMetadataId The ID of the comic metadata.
 * @returns void
 */
export const parseAndLoadTeamsFromComicInfoXmlMetadata = (
	metadata: ComicInfo,
	comicMetadataId: number
): void => {
	if (!metadata) {
		logger.error('ComicsParser... No metadata or comicInfoXml found');
		return;
	}

	const teamRaw = metadata.Teams ?? "";
	const teams = splitProperty(teamRaw);

	if (teams.length > 0) {
		logger.info(`ComicsParser... Inserting teams for ${teams.join(", ")}`);
		for (const team of teams) {
			logger.info(`ComicsParser... Inserting team for ${team}`);
			let teamId = null;

			try {
				teamId = insertComicTeamQuery(team);
				logger.info(`ComicsParser... Inserted team for ${team} with ID: ${teamId}`);
			} catch (error) {
				logger.error(`ComicsParser... Error inserting team for ${team}: ${error}`);
			}

			if (!teamId) {
				logger.error(
					`ComicsParser... Failed to insert team for ${team}, cannot insert comic metadata team.`
				);
				continue;
			}

			try {
				insertComicMetadataTeamQuery(comicMetadataId, teamId);
			} catch (error) {
				logger.error(
					`ComicsParser... Error inserting comic metadata team for ${comicMetadataId}, ${teamId}: ${error}`
				);
			}
		}
	}
};