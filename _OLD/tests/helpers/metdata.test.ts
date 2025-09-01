import "@std/dotenv/load";
import { assertEquals } from "jsr:@std/assert";

import { getMetadata } from "../../src/helpers/metadata.ts";

Deno.test("getMetadata - fetch metadata for a comic file", async () => {
  const filePath = Deno.env.get("SINGLE_COMIC") || ""; // Adjust the path to your test file
  const metadata = await getMetadata(filePath);
  

  assertEquals(metadata.comicInfoXml.Series, "Batgirl", "Expected series to be 'Batgirl'");
  assertEquals(metadata.comicInfoXml.Number, "1", "Expected issue number to be '1'");
  assertEquals(metadata.comicInfoXml.Year, "2025", "Expected year to be '2025'");
  assertEquals(metadata.comicInfoXml.Publisher, "DC Comics", "Expected publisher to be 'DC Comics'");
  assertEquals(metadata.comicInfoXml.Writer, "Tate Brombal", "Expected writer to be 'Tate Brombal'");
  assertEquals(metadata.comicInfoXml.Title, "Mother: Part 1 of 6", "Expected title to be 'Mother: Part 1 of 6'");
  assertEquals(metadata.comicInfoXml.Tags, undefined, "Expected tags to be undefined");
  assertEquals(metadata.comicInfoXml.Volume, undefined, "Expected volume to be undefined");
});