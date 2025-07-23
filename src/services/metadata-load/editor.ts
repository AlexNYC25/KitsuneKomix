import logger from "../../utilities/logger.ts";
import type { ComicInfo } from "npm:comic-metadata-tool/dist/src/interfaces/comicInfo.d.ts";

import { splitProperty } from "../../helpers/propertyParsing.ts";

import { insertComicEditorQuery } from "../../database/queries/comicEditors.ts";
import { insertComicMetadataEditorQuery } from "../../database/queries/comicMetadataEditors.ts";

/**
 * Parses and loads editors from ComicInfo XML metadata.
 * @param metadata The ComicInfo metadata object.
 * @param comicMetadataId The ID of the comic metadata.
 * @returns void
 */
export const parseAndLoadEditorsFromComicInfoXmlMetadata = (
	metadata: ComicInfo,
	comicMetadataId: number
): void => {
	if (!metadata) {
		logger.error(`ComicsParser... No metadata or comicInfoXml found`);
		return;
	}

	const editorRaw = metadata.Editor ?? "";
	const editors = splitProperty(editorRaw);

	if (editors.length > 0) {
		logger.info(`ComicsParser... Inserting editors for ${editors.join(", ")}`);
		for (const editor of editors) {
			logger.info(`ComicsParser... Inserting editor for ${editor}`);
			let editorId = null;

			try {
				editorId = insertComicEditorQuery(editor);
				logger.info(`ComicsParser... Inserted editor for ${editor} with ID: ${editorId}`);
			} catch (error) {
				logger.error(`ComicsParser... Error inserting editor for ${editor}: ${error}`);
			}

			if (!editorId) {
				logger.error(
					`ComicsParser... Failed to insert editor for ${editor}, cannot insert comic metadata editor.`
				);
				continue;
			}

			try {
				insertComicMetadataEditorQuery(comicMetadataId, editorId);
			} catch (error) {
				logger.error(`ComicsParser... Error inserting comic metadata editor for ${comicMetadataId}, ${editorId}: ${error}`);
			}
		}
	}
};