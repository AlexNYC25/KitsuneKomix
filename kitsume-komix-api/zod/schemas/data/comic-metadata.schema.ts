import { z } from "@hono/zod-openapi";

/**
 * Schema for modifiable comic metadata fields
 * 
 * Defines which fields can be modified in comic metadata
 */
export const modifyableComicMetadataFieldsSchema = z.enum([
  "writers",
  "pencillers",
  "inkers",
  "colorists",
  "letterers",
  "editors",
  "coverArtists",
  "publishers",
  "imprints",
  "genres",
  "characters",
  "teams",
  "locations",
  "storyArcs",
  "seriesGroups",
]);


export const metadataUpdateSchema = z.object({
  metadataType: modifyableComicMetadataFieldsSchema,
  values: z.array(z.string()).nullable(),
}).openapi({
  title: "ComicMetadataUpdate",
  description: "Schema for updating comic metadata fields",
});

/**
 * Schema for comic series metadata
 * 
 * Includes various optional fields for comic series information from the various
 * metadata categories from their respective databases tables.
 */
export const metadataSchema = z.object({
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