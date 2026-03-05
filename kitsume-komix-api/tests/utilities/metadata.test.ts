import { assert, assertEquals, assertExists } from "@std/assert";
import { dirname, fromFileUrl, join } from "@std/path";

import { standardizeMetadata, loadMetadataIntoCache, retrieveMetadataFromCache, removeMetadataFromCache } from "#utilities/metadata.ts";
import { StandardizedComicMetadata } from "#interfaces/index.ts";

// The first step of the extract-metadata job processor 
// is to standardize the metadata from the comic file, so we want to ensure that this step is 
// working correctly by testing the standardizeMetadata function directly with a known test file. 
Deno.test("extract-metadata - ensure metadata is read correctly", async () => {
	const currentDir = dirname(fromFileUrl(import.meta.url));
	const testFilePath = join(currentDir, "..", "testFiles", "Batman 001 (2016).cbz");

	// check if the file exists before trying to extract metadata
	const fileExists = await Deno.stat(testFilePath).then(() => true).catch(() => false);
	if (!fileExists) {
		throw new Error(`Test file does not exist at path: ${testFilePath}`);
	}

	const metadata: StandardizedComicMetadata | undefined = await standardizeMetadata(testFilePath);

	if (!metadata) {
		throw new Error("Metadata extraction failed, got undefined");
	}

	assertExists(metadata, "Metadata should be defined");

	// Note: These assertions are based on the known metadata for the test file "Batman 001 (2016).cbz" 
	// and may need to be updated if the test file is changed or if the metadata extraction logic is updated.
	assert(metadata.series === "Batman", `Expected series to be "Batman", got "${metadata.series}"`);
	assert(metadata.title === "I Am Gotham Part One", `Expected title to be "I Am Gotham Part One", got "${metadata.title}"`);
	assert(metadata.issueNumber === "1", `Expected issue number to be "1", got "${metadata.issueNumber}"`);
	assert(metadata.summary && metadata.summary.length > 0, "Expected summary to be defined and not empty");

	assert(metadata.storyArcs && metadata.storyArcs.length > 0, "Expected story arcs to be defined and not empty");
	assert(metadata.publisher && metadata.publisher[0] === "DC Comics", `Expected publisher to be "DC Comics", got "${metadata.publisher}"`);
	assert(metadata.day && metadata.day == 31, `Expected day to be 31, got "${metadata.day}"`);
	assert(metadata.month && metadata.month == 8, `Expected month to be 8, got "${metadata.month}"`);
	assert(metadata.year && metadata.year == 2016, `Expected year to be 2016, got "${metadata.year}"`);

	assert(metadata.web && metadata.web.length > 0, "Expected web to be defined and not empty");
	assert(metadata.pageCount && metadata.pageCount > 0, "Expected page count to be defined and greater than 0");

	assert(metadata.characters && metadata.characters.length > 0, "Expected characters to be defined and not empty");
	assert(metadata.teams && metadata.teams.length > 0, "Expected teams to be defined and not empty");
	assert(metadata.locations && metadata.locations.length > 0, "Expected locations to be defined and not empty");
	assert(metadata.writers && metadata.writers.length > 0, "Expected writers to be defined and not empty");
	assert(metadata.pencillers && metadata.pencillers.length > 0, "Expected pencillers to be defined and not empty");
	assert(metadata.inkers && metadata.inkers.length > 0, "Expected inkers to be defined and not empty");
	assert(metadata.colorists && metadata.colorists.length > 0, "Expected colorists to be defined and not empty");
	assert(metadata.letterers && metadata.letterers.length > 0, "Expected letterers to be defined and not empty");
	assert(metadata.editors && metadata.editors.length > 0, "Expected editors to be defined and not empty");
	assert(metadata.coverArtists && metadata.coverArtists.length > 0, "Expected cover artists to be defined and not empty");
});

// The second test ensures that the caching mechanism for the standardized metadata is working correctly 
// by writing metadata to the cache and then retrieving it to confirm it matches the original metadata.
Deno.test("extract-metadata - write and read metadata into cache", async () => {
	const currentDir = dirname(fromFileUrl(import.meta.url));
	const testFilePath = join(currentDir, "..", "testFiles", "Batman 001 (2016).cbz");

	// check if the file exists before trying to extract metadata
	const fileExists = await Deno.stat(testFilePath).then(() => true).catch(() => false);
	if (!fileExists) {
		throw new Error(`Test file does not exist at path: ${testFilePath}`);
	}

	const metadata: StandardizedComicMetadata | undefined = await standardizeMetadata(testFilePath);

	if (!metadata) {
		throw new Error("Metadata extraction failed, got undefined");
	}

	// Test writing to cache
	await loadMetadataIntoCache(testFilePath, metadata);

	// Test reading from cache
	const cachedMetadata: StandardizedComicMetadata | null = await retrieveMetadataFromCache(testFilePath);

	assertExists(cachedMetadata, "Cached metadata should be defined");
	assertEquals(cachedMetadata, metadata, "Cached metadata should match the original metadata");

	// Clean up cache after test
	await removeMetadataFromCache(testFilePath);

	assertEquals(await retrieveMetadataFromCache(testFilePath), null, "Metadata should be removed from cache");
});