import { z } from "@hono/zod-openapi";

import {
  ComicCharacterSelectSchema,
  ComicColoristSelectSchema,
  ComicCoverArtistSelectSchema,
  ComicEditorSelectSchema,
  ComicGenreSelectSchema,
  ComicImprintSelectSchema,
  ComicInkerSelectSchema,
  ComicLettererSelectSchema,
  ComicLocationSelectSchema,
  ComicPencillerSelectSchema,
  ComicPublisherSelectSchema,
  ComicSeriesGroupSelectSchema,
  ComicStoryArcSelectSchema,
  ComicTeamSelectSchema,
  ComicWriterSelectSchema,
} from "./database.schema.ts";

export const metadataUpdateSchema = z.object({
  metadataType: z.string(),
  values: z.array(z.string()).nullable(),
  replaceExisting: z.boolean().optional().default(false),
}).openapi({
  title: "ComicMetadataUpdate",
  description: "Schema for updating comic metadata fields",
});

/**
 * Schema for comic series metadata
 *
 * Includes various optional fields for comic series information from the various
 * metadata categories from their respective databases tables.
 *
 * Note: At this point the metadata rows are read and parsed for the name/publisher/arc name and stored as comma-separated strings in the metadata fields of the comic series. This is to avoid the complexity of joining with multiple metadata tables for each category and instead just have a single metadata field that can be easily queried and updated. In the future, if we want to support more complex querying and updating of metadata, we can consider normalizing the metadata into separate tables and joining them with the comic series table.
 */
export const MetadataSchema = z.object({
  writers: z.string().optional(),
  pencillers: z.string().optional(),
  inkers: z.string().optional(),
  colorists: z.string().optional(),
  letterers: z.string().optional(),
  editors: z.string().optional(),
  coverArtists: z.string().optional(),
  publishers: z.string().optional(),
  imprints: z.string().optional(),
  genres: z.string().optional(),
  characters: z.string().optional(),
  teams: z.string().optional(),
  locations: z.string().optional(),
  storyArcs: z.string().optional(),
  seriesGroups: z.string().optional(),
}).openapi({
  title: "ComicSeriesMetadata",
  description: "Metadata for a comic series",
});

/**
 * Expanded metadata schema with arrays of related entities for each category
 * This is used for responses where we want to include the full metadata information with related entities instead of just the comma-separated strings.
 */
export const MetadataExpandedSchema = z.object({
  writers: z.array(ComicWriterSelectSchema).optional(),
  pencillers: z.array(ComicPencillerSelectSchema).optional(),
  inkers: z.array(ComicInkerSelectSchema).optional(),
  colorists: z.array(ComicColoristSelectSchema).optional(),
  letterers: z.array(ComicLettererSelectSchema).optional(),
  editors: z.array(ComicEditorSelectSchema).optional(),
  coverArtists: z.array(ComicCoverArtistSelectSchema).optional(),
  publishers: z.array(ComicPublisherSelectSchema).optional(),
  imprints: z.array(ComicImprintSelectSchema).optional(),
  genres: z.array(ComicGenreSelectSchema).optional(),
  characters: z.array(ComicCharacterSelectSchema).optional(),
  teams: z.array(ComicTeamSelectSchema).optional(),
  locations: z.array(ComicLocationSelectSchema).optional(),
  storyArcs: z.array(ComicStoryArcSelectSchema).optional(),
  seriesGroups: z.array(ComicSeriesGroupSelectSchema).optional(),
}).openapi({
  title: "ComicSeriesMetadata",
  description: "Metadata for a comic series",
});
