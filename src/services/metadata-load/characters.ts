import logger from "../../utilities/logger.ts";
import type { ComicInfo } from "npm:comic-metadata-tool/dist/src/interfaces/comicInfo.d.ts";

import { splitProperty } from "../../helpers/propertyParsing.ts";

import { insertComicCharacterQuery } from "../../database/queries/comicCharacters.ts";
import { insertComicMetadataCharacterQuery } from "../../database/queries/comicMetadataCharacters.ts";

/**
 * Parses and loads characters from ComicInfo XML metadata.
 * @param metadata The ComicInfo metadata object.
 * @param comicMetadataId The ID of the comic metadata.
 * @returns void
 */
export const parseAndLoadCharactersFromComicInfoXmlMetadata = (
	metadata: ComicInfo,
	comicMetadataId: number
): void => {
	if (!metadata) {
		logger.error('ComicsParser', 'No metadata or comicInfoXml found');
		return;
	}

	const characterRaw = metadata.Characters ?? "";
	const characters = splitProperty(characterRaw);

	if (characters.length > 0) {
		logger.info(`ComicsParser... Inserting characters for ${characters.join(", ")}`);
		for (const character of characters) {
			logger.info(`ComicsParser... Inserting character for ${character}`);
			let characterId = null;

			try {
				characterId = insertComicCharacterQuery(character);
				logger.info(`ComicsParser... Inserted character for ${character} with ID: ${characterId}`);
			} catch (error) {
				logger.error(`ComicsParser... Error inserting character for ${character}: ${error}`);
			}

			if (!characterId) {
				logger.error(
					`ComicsParser... Failed to insert character for ${character}, cannot insert comic metadata character.`
				);
				continue;
			}

			try {
				insertComicMetadataCharacterQuery(comicMetadataId, characterId);
			} catch (error) {
				logger.error(`ComicsParser... Error inserting comic metadata character for ${comicMetadataId}, ${characterId}: ${error}`);
			}
		}
	}
};