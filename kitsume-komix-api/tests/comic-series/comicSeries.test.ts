import { assert, assertEquals, assertExists } from "@std/assert";
import { dirname, fromFileUrl, join } from "@std/path";

import { 
deleteComicSeries,
	getComicSeriesByPath,
  insertComicSeries,
} from "#sqlite/models/comicSeries.model.ts";
import { loadMetadataIntoCache, retrieveMetadataFromCache, standardizeMetadata } from "#utilities/metadata.ts";
import { StandardizedComicMetadata } from "#interfaces/index.ts";
import { NewComicSeries } from "#types/index.ts";

// Note: from the inital process-comic-series job there are 2 different routes that can be taken
// depending on whether the parent folder of the comic book file is already linked to a series or not.

// This test ensures that the getComicSeriesByPath function correctly returns null for 
// a new comic book file that has not been linked to any series yet.
Deno.test("process-comic-series - should return null for a new comic book file", async () => {
	const currentDir = dirname(fromFileUrl(import.meta.url));
	const testFilePath = join(currentDir, "..", "testFiles", "Batman 001 (2016).cbz");
	const parentPath = dirname(testFilePath);

	// Initally the test file should not be linked to any series, so we expect null
	const initialSeries = await getComicSeriesByPath(parentPath);
	assertEquals(initialSeries, null);

	// we know that the test file has metadata 
	const standardizedMetadata: StandardizedComicMetadata | undefined = await standardizeMetadata(testFilePath);
	assertExists(standardizedMetadata, "Standardized metadata should be extracted for the test file");

	// we want to rely on the metadata from the cache for real world scenarios
	loadMetadataIntoCache(testFilePath, standardizedMetadata!);

	// now we simulate the add-new-comic-series job being processed 
	// which would create a new series linked to the parent folder of the test file
	const seriesName = parentPath.split("/").pop();

	assert(seriesName, "Series name should be derived from parent folder name");

	const comicMetadata: StandardizedComicMetadata | null = await retrieveMetadataFromCache(testFilePath);

	assertExists(comicMetadata, "Comic metadata should be available for the test file");

	const seriesData: NewComicSeries = {
		name: comicMetadata?.series || seriesName,
		description: null,
		folderPath: parentPath,
	};

	const seriesId = await insertComicSeries(seriesData);

	assert(seriesId, "Series ID should be returned after insertion");

	// After inserting the new series, we should be able to retrieve it by the parent folder path
	const retrievedSeries = await getComicSeriesByPath(parentPath);

	assertExists(retrievedSeries, "Retrieved series should exist after insertion");
	assertEquals(retrievedSeries?.id, seriesId, "Retrieved series ID should match inserted series ID");

	// CLEANUP


	// now we can clean up by deleting the test series from the database
	await deleteComicSeries(seriesId);

	// After deletion, we should get null again when trying to retrieve the series by the parent folder path
	const seriesAfterDeletion = await getComicSeriesByPath(parentPath);
	assertEquals(seriesAfterDeletion, null, "Series should be null after deletion");
});


