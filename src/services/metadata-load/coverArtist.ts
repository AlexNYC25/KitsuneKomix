import logger from "../../utilities/logger.ts";
import type { ComicInfo } from "npm:comic-metadata-tool/dist/src/interfaces/comicInfo.d.ts";

import { splitProperty } from "../../helpers/propertyParsing.ts";

import { insertComicCoverArtistQuery } from "../../database/queries/comicCoverArtists.ts";
import { insertComicMetadataCoverArtistQuery } from "../../database/queries/comicMetadataCoverArtists.ts";

/**
 * Parses and loads cover artists from ComicInfo XML metadata.
 * @param metadata The ComicInfo metadata object.
 * @param comicMetadataId The ID of the comic metadata.
 * @returns void
 */
export const parseAndLoadCoverArtistsFromComicInfoXmlMetadata = (
	metadata: ComicInfo,
	comicMetadataId: number
): void => {
	if (!metadata) {
		logger.error(`ComicsParser... No metadata or comicInfoXml found`);
		return;
	}

	const coverArtistRaw = metadata.CoverArtist ?? "";
	const coverArtists = splitProperty(coverArtistRaw);

	if (coverArtists.length > 0) {
		logger.info(`ComicsParser... Inserting cover artists for ${coverArtists.join(", ")}`);
		for (const coverArtist of coverArtists) {
			logger.info(`ComicsParser... Inserting cover artist for ${coverArtist}`);
			let coverArtistId = null;

			try {
				coverArtistId = insertComicCoverArtistQuery(coverArtist);
				logger.info(`ComicsParser... Inserted cover artist for ${coverArtist} with ID: ${coverArtistId}`);
			} catch (error) {
				logger.error(`ComicsParser... Error inserting cover artist for ${coverArtist}: ${error}`);
			}

			if (!coverArtistId) {
				logger.error(
					`ComicsParser... Failed to insert cover artist for ${coverArtist}, cannot insert comic metadata cover artist.`
				);
				continue;
			}

			try {
				insertComicMetadataCoverArtistQuery(comicMetadataId, coverArtistId);
			} catch (error) {
				logger.error(`ComicsParser... Error inserting comic metadata cover artist for ${comicMetadataId}, ${coverArtistId}: ${error}`);
			}
		}
	}
};