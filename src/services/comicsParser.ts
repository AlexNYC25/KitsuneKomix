import logger from "../utilities/logger.ts";

import { hashFolder, hashFile } from "../helpers/hash.ts";
import { getMetadata } from "../helpers/metadata.ts";
import { getComicFileProperties } from "../helpers/fileNames.ts";
import { getFilesWithParentDirs } from "../helpers/walkDirs.ts";
import { getSeriesFolderProperties } from "../helpers/folderNames.ts";

import { getAppSettingQuery, updateAppSettingQuery } from "../database/queries/appSettings.ts";
import { getComicBookByHashQuery } from "../database/queries/comicBooks.ts";
import { getLibrariesQuery } from "../database/queries/comicLibraries.ts";

import { ComicLibrary } from "../interfaces/comic-library.interface.ts";

import { parseAndLoadComicSeriesFromFileName, parseAndLoadComicSeriesFromComicInfoXmlMetadata } from "./metadata-load/series.ts";
import { parseAndLoadComicMetadataFromComicInfoXmlMetadata, parseAndLoadComicMetadataFromFileName } from "./metadata-load/metadata.ts";
import { parseAndLoadComicBookFromComicInfoXmlMetadata, parseAndLoadComicBookFromFileName } from "./metadata-load/comic.ts";
import { parseAndLoadSeriesGroupsFromComicInfoXmlMetadata } from "./metadata-load/seriesGroup.ts";
import { parseAndLoadStoryArcsFromComicInfoXmlMetadata } from "./metadata-load/storyArc.ts";
import { parseAndLoadWritersFromComicInfoXmlMetadata } from "./metadata-load/writer.ts";
import { parseAndLoadPencillersFromComicInfoXmlMetadata } from "./metadata-load/penciller.ts";
import { parseAndLoadInkersFromComicInfoXmlMetadata } from "./metadata-load/inker.ts";
import { parseAndLoadColoristsFromComicInfoXmlMetadata } from "./metadata-load/colorist.ts";
import { parseAndLoadLetterersFromComicInfoXmlMetadata } from "./metadata-load/letterer.ts";
import { parseAndLoadCoverArtistsFromComicInfoXmlMetadata } from "./metadata-load/coverArtist.ts";
import { parseAndLoadEditorsFromComicInfoXmlMetadata } from "./metadata-load/editor.ts";
import { parseAndLoadPublishersFromComicInfoXmlMetadata } from "./metadata-load/publisher.ts";
import { parseAndLoadImprintsFromComicInfoXmlMetadata } from "./metadata-load/imprint.ts";
import { parseAndLoadGenresFromComicInfoXmlMetadata } from "./metadata-load/genre.ts";
import { parseAndLoadCharactersFromComicInfoXmlMetadata } from "./metadata-load/characters.ts";
import { parseAndLoadTeamsFromComicInfoXmlMetadata } from "./metadata-load/teams.ts";
import { parseAndLoadLocationsFromComicInfoXmlMetadata } from "./metadata-load/locations.ts";
import { parseAndLoadAgeRatingsFromComicInfoXmlMetadata } from "./metadata-load/ageRating.ts";


export const parseComicsDirectory = async () => {
  const dirPath = Deno.env.get("COMICS_DIR") || "";
  if (!dirPath) {
    throw new Error("COMICS_DIR environment variable is not set.");
  }

  let okToParse = false;

  // Always fetch the latest value from the DB on every call
  logger.info('ComicsParser task... Fetching latest comic_folder_hash from DB...');
  const appSetting = getAppSettingQuery("comic_folder_hash");
  logger.info(`ComicsParser task... Fetched comic_folder_hash: ${appSetting?.setting_value}`);

  if (!appSetting) {
    throw new Error("App setting 'comic_folder_hash' not found in the database.");
  }

  if (appSetting.setting_value === "NOT_SET") {
    logger.info(`ComicsParser task... Comic folder hash is not set, parsing comics directory...`);
    okToParse = true;
  }

  // calculate the hash of the comics directory
  // If the hash is different from the one in the app_settings table, we need to parse the comics directory
  // If the hash is the same, we don't need to parse the comics directory
  const currentHash = await hashFolder(dirPath);
  logger.info(`ComicsParser task... Current comics directory hash: ${currentHash}`);
  logger.info(`ComicsParser task... DB hash: "${appSetting.setting_value}", Current hash: "${currentHash}"`);
  if (currentHash.trim() !== String(appSetting.setting_value).trim()) {
    logger.info(`ComicsParser task... Comic folder hash has changed, parsing comics directory...`);
    okToParse = true;
  }

  if (!okToParse) {
    logger.info(`ComicsParser task... Comic folder hash is up to date, no need to parse comics directory.`);
    return;
  }

  // Use the helper function to get files with parent directories
  // This will return an array of objects with file paths and their parent directories
  // Each object will have the structure: { filePath: string, parentDir: string }
  // This will help in organizing comics by their parent directories
  // and can be used to update the database or perform other operations as needed
  logger.info(`ComicsParser task... Starting to parse comics directory: ${dirPath}`);

  const files = await getFilesWithParentDirs(dirPath, true, [".cbz", ".cbr", ".cb7", ".pdf"]);

  // Update the app_settings table with the new hash before processing
  // This ensures that if the process is interrupted, we don't reprocess everything
  updateAppSettingQuery("comic_folder_hash", currentHash);

  // Get all enabled libraries from the database
  const libraries = getLibrariesQuery().filter(lib => lib.enabled);
  
  if (libraries.length === 0) {
    logger.info('ComicsParser task... No enabled libraries found. Skipping comics parsing.');
    return;
  }

  logger.info(`ComicsParser task... Found ${libraries.length} enabled libraries to process.`);
  
  let totalNewFiles = 0;
  let totalSkippedFiles = 0;

  // Process each library
  for (const library of libraries) {
    await parseLibrary(library);
    
    // Add counts from this library to totals
    totalNewFiles += library.newFilesCount || 0;
    totalSkippedFiles += library.skippedFilesCount || 0;
  }
  
  logger.info(`ComicsParser task... Finished parsing all libraries. Processed ${totalNewFiles} new files, skipped ${totalSkippedFiles} existing files.`);

}

/**
 * Parse a specific library
 */
const parseLibrary = async (library: ComicLibrary): Promise<void> => {
  const libraryPath = library.path;
  let okToParse = false;
  
  // Each library has its own hash setting
  const hashSettingName = `library_hash_${library.id}`;
  
  logger.info(`ComicsParser task... Processing library "${library.name}" at ${libraryPath}`);
  
  // Get hash from DB
  const appSetting = getAppSettingQuery(hashSettingName);
  
  if (!appSetting) {
    // Create setting if it doesn't exist
    //createAppSettingQuery(hashSettingName, "NOT_SET");
    okToParse = true;
  } else if (appSetting.setting_value === "NOT_SET") {
    okToParse = true;
  }
  
  // Calculate hash for this library
  const currentHash = await hashFolder(libraryPath);
  logger.info(`ComicsParser task... Library "${library.name}" hash: ${currentHash}`);
  
  if (appSetting && currentHash.trim() !== String(appSetting.setting_value).trim()) {
    logger.info(`ComicsParser task... Library "${library.name}" hash has changed, parsing...`);
    okToParse = true;
  }
  
  if (!okToParse) {
    logger.info(`ComicsParser task... Library "${library.name}" hash is up to date, skipping.`);
    return;
  }
  
  // Update hash before processing
  updateAppSettingQuery(hashSettingName, currentHash);
  
  // Get all comic files in this library
  const files = await getFilesWithParentDirs(libraryPath, true, [".cbz", ".cbr", ".cb7", ".pdf"]);
  
  library.newFilesCount = 0;
  library.skippedFilesCount = 0;
  
  // Process each file with library context
  for (const file of files) {
    const comicFileHash = await hashFile(file.file);
    const existingComic = getComicBookByHashQuery(comicFileHash);
    
    if (existingComic && existingComic.file_path === file.file) {
      logger.info(`ComicsParser task... Skipping existing comic: ${file.file}`);
      library.skippedFilesCount++;
      continue;
    }
    
    // Pass library ID to the file parser
    await parseComicFile({
      file: file.file,
      parentDir: file.directory,
      libraryId: library.id
    });
    
    library.newFilesCount++;
  }
  
  logger.info(`ComicsParser task... Finished parsing library "${library.name}". Processed ${library.newFilesCount} new files, skipped ${library.skippedFilesCount} existing files.`);
};

/**
 * The per comic file parsing function.
 * This function will parse an individual comic file and insert the metadata into the database, depending on the metadata available.
 * If the metadata is not available, it will parse the file name and folder name to extract the metadata.
 * @param file The path to the comic file to parse.
 * @param parentDir The parent directory of the comic file.
 * @returns {Promise<void>} A promise that resolves when the parsing is complete.
 */
const parseComicFile = async ({ file, parentDir, libraryId }: { file: string; parentDir: string; libraryId: number }) => {
  logger.info(`ComicsParser task... Parsing comic file: ${file}`);

  // first get the series metadata from the file by parsing the file name
  const seriesMetadataFromFileName = getComicFileProperties(file);
  // and the series metadata from the folder by parsing the folder name
  const seriesMetadataFromFolder = getSeriesFolderProperties(parentDir);
  // We want to parse these metadata values so that if we don't have a metadata object from the file then we can fallback to the this metadata
  const comicFileHash = await hashFile(file);

  let metadata = null;

  try {
    metadata = await getMetadata(file);
  } catch (error) {
    logger.error(`ComicsParser task... Error fetching metadata for ${file}: ${error}`);
  }

  if (!metadata) {
    logger.info(`ComicsParser task... No metadata found for file: ${file}`);

    // insert the series metadata from the metadata to the database, assuming the series metadata record in not already in the database
    const seriesId = parseAndLoadComicSeriesFromFileName(
      parentDir,
      seriesMetadataFromFileName,
      seriesMetadataFromFolder,
      libraryId
    );

    if (!seriesId) {
      logger.error(`ComicsParser task... Failed to insert series metadata for ${seriesMetadataFromFileName.seriesName}, cannot insert comic book.`);
      return;
    }

    const metadataId = parseAndLoadComicMetadataFromFileName(seriesMetadataFromFileName, seriesMetadataFromFolder);

    if (!metadataId) {
      logger.error(`ComicsParser task... Failed to insert comic metadata for ${seriesMetadataFromFileName.seriesName} - ${seriesMetadataFromFileName.issueNumber}, cannot insert comic book.`);
      return;
    }

    // Using the above insert id's then we insert the comic book wiht the foreign key references to the series record and metadata record
    const comicId = parseAndLoadComicBookFromFileName(file, comicFileHash, seriesMetadataFromFileName, metadataId, seriesId);

  } else if (metadata && metadata.comicInfoXml) {
    // insert the series metadata from the folder to the database, assuming the series metadata record in not already in the database
    const seriesId = parseAndLoadComicSeriesFromComicInfoXmlMetadata(metadata.comicInfoXml, parentDir, seriesMetadataFromFileName, seriesMetadataFromFolder, libraryId);

    if (!seriesId) {
      logger.error(`ComicsParser task... Failed to insert series metadata for ${metadata.comicInfoXml.Series}, cannot insert comic book.`);
      return;
    }

    // insert the comic book metadata record into the database using the basic info we parsed from the file name
    const metadataId = parseAndLoadComicMetadataFromComicInfoXmlMetadata(metadata.comicInfoXml, seriesMetadataFromFileName, seriesMetadataFromFolder);

    if (!metadataId) {
      logger.error(`ComicsParser task... Failed to insert comic metadata for ${metadata.comicInfoXml.Title}, cannot insert comic book.`);
      return;
    }

    // Using the above insert id's then we insert the comic book with the foreign key references to the series record and metadata record
    const comicId = parseAndLoadComicBookFromComicInfoXmlMetadata(metadata.comicInfoXml, file, comicFileHash, metadataId, seriesId);

    parseAndLoadSeriesGroupsFromComicInfoXmlMetadata(metadata.comicInfoXml, metadataId);

    parseAndLoadStoryArcsFromComicInfoXmlMetadata(metadata.comicInfoXml, metadataId);

    parseAndLoadWritersFromComicInfoXmlMetadata(metadata.comicInfoXml, metadataId);

    parseAndLoadPencillersFromComicInfoXmlMetadata(metadata.comicInfoXml, metadataId);

    parseAndLoadInkersFromComicInfoXmlMetadata(metadata.comicInfoXml, metadataId);

    parseAndLoadColoristsFromComicInfoXmlMetadata(metadata.comicInfoXml, metadataId);

    parseAndLoadLetterersFromComicInfoXmlMetadata(metadata.comicInfoXml, metadataId);

    parseAndLoadCoverArtistsFromComicInfoXmlMetadata(metadata.comicInfoXml, metadataId);

    parseAndLoadEditorsFromComicInfoXmlMetadata(metadata.comicInfoXml, metadataId);

    parseAndLoadPublishersFromComicInfoXmlMetadata(metadata.comicInfoXml, metadataId);

    parseAndLoadImprintsFromComicInfoXmlMetadata(metadata.comicInfoXml, metadataId);

    parseAndLoadGenresFromComicInfoXmlMetadata(metadata.comicInfoXml, metadataId);

    parseAndLoadCharactersFromComicInfoXmlMetadata(metadata.comicInfoXml, metadataId);

    parseAndLoadTeamsFromComicInfoXmlMetadata(metadata.comicInfoXml, metadataId);

    parseAndLoadLocationsFromComicInfoXmlMetadata(metadata.comicInfoXml, metadataId);

    parseAndLoadAgeRatingsFromComicInfoXmlMetadata(metadata.comicInfoXml, metadataId);

    // This needs to be seperated into a different process where we uncompress the comic file and then parse the pages to 
    // get the file paths so we can generate the hashes and insert the pages into the database with the metadata
    /*
    if (metadata.comicInfoXml.Pages) {
      const pages = metadata.comicInfoXml.Pages
      for (const page of pages) {
        let pageTypeId = null;

        try {
          pageTypeId = getComicPageTypeId(page.Type);
          logger.info('ComicsParser', `Fetched page type ID for ${page.Type}: ${pageTypeId}`);
        } catch (error) {
          logger.error('ComicsParser', `Error fetching page type ID for ${page.Type}: ${error}`);
        }

        if (pageTypeId) {
          page.type_id = pageTypeId;
        } else {
          logger.warn('ComicsParser', `No page type ID found for ${page.Type}, using default type ID.`);
          page.type_id = null;
        }

        let pageId = null;
        try {

          const pageObject: ComicPage = {
            id: null,
            metadata_id: null,
            page_number: page.Image,
            double_page: page.DoublePage || false,
            image_size: page.ImageSize || null,
            image_width: page.ImageWidth || null,
            image_height: page.ImageHeight || null,
            image_path: null, // TODO: Update for actual image path if available
            key_image: page.Key || false,
            image_hash: null, // TODO: Update for actual image hash if available
            page_type_id: pageTypeId || null,

          }

          pageId = insertComicPageQuery(page);
          logger.info('ComicsParser', `Inserted page for ${page} with ID: ${pageId}`);
        } catch (error) {
          logger.error('ComicsParser', `Error inserting page for ${page}: ${error}`);
        }

        if (!pageId) {
          logger.error('ComicsParser', `Failed to insert page for ${page}, cannot insert comic metadata page.`);
          continue;
        }

        try {
          insertComicMetadataPageQuery(comicMetadataId, pageId);
        } catch (error) {
          logger.error('ComicsParser', `Error inserting comic metadata page for ${comicMetadataId}, ${pageId}: ${error}`);
        }
      }
    }
    */
  }

  logger.info(`ComicsParser task... Finished parsing comic file: ${file}`);
};