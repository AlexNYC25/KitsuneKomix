import { z } from "@hono/zod-openapi";


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
  writers: z.string().nullable().optional(),
  pencillers: z.string().nullable().optional(),
  inkers: z.string().nullable().optional(),
  colorists: z.string().nullable().optional(),
  letterers: z.string().nullable().optional(),
  editors: z.string().nullable().optional(),
  coverArtists: z.string().nullable().optional(),
  publishers: z.string().nullable().optional(),
  imprints: z.string().nullable().optional(),
  genres: z.string().nullable().optional(),
  characters: z.string().nullable().optional(),
  teams: z.string().nullable().optional(),
  locations: z.string().nullable().optional(),
  storyArcs: z.string().nullable().optional(),
  seriesGroups: z.string().nullable().optional(),
}).openapi({
  title: "ComicSeriesMetadata",
  description: "Metadata for a comic series",
});