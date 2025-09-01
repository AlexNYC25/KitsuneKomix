import logger from "../../utilities/logger.ts";
import type { ComicInfo } from "npm:comic-metadata-tool/dist/src/interfaces/comicInfo.d.ts";

import { splitProperty } from "../../helpers/propertyParsing.ts";

import { insertComicGenreQuery } from "../../database/queries/comicGenres.ts";
import { insertComicMetadataGenreQuery } from "../../database/queries/comicMetadataGenres.ts";

/**
 * Parses and loads genres from ComicInfo XML metadata.
 * @param metadata The ComicInfo metadata object.
 * @param comicMetadataId The ID of the comic metadata.
 * @returns void
 */
export const parseAndLoadGenresFromComicInfoXmlMetadata = (
	metadata: ComicInfo,
	comicMetadataId: number
): void => {
	if (!metadata) {
		logger.error(`ComicsParser... No metadata or comicInfoXml found`);
		return;
	}

	const genreRaw = metadata.Genre ?? "";
	const genres = splitProperty(genreRaw);

	if (genres.length > 0) {
		logger.info(`ComicsParser... Inserting genres for ${genres.join(", ")}`);
		for (const genre of genres) {
			logger.info(`ComicsParser... Inserting genre for ${genre}`);
			let genreId = null;

			try {
				genreId = insertComicGenreQuery(genre);
				logger.info(`ComicsParser... Inserted genre for ${genre} with ID: ${genreId}`);
			} catch (error) {
				logger.error(`ComicsParser... Error inserting genre for ${genre}: ${error}`);
			}

			if (!genreId) {
				logger.error(
					`ComicsParser... Failed to insert genre for ${genre}, cannot insert comic metadata genre.`
				);
				continue;
			}

			try {
				insertComicMetadataGenreQuery(comicMetadataId, genreId);
			} catch (error) {
				logger.error(`ComicsParser... Error inserting comic metadata genre for ${comicMetadataId}, ${genreId}: ${error}`);
			}
		}
	}
};