import { z } from "zod";

import {
  ComicBookSelectSchema, // ComicBook
  ComicBookThumbnailSelectSchema,
  ComicCharacterSelectSchema,
  ComicColoristSelectSchema,
  ComicCoverArtistSelectSchema,
  ComicEditorSelectSchema,
  ComicGenreSelectSchema,
  ComicImprintSelectSchema,
  ComicInkerSelectSchema,
  ComicLettererSelectSchema,
  ComicLocationSelectSchema,
  ComicPencilerSelectSchema,
  ComicPublisherSelectSchema,
  ComicSeriesGroupSelectSchema,
  ComicStoryArcSelectSchema,
  ComicTeamSelectSchema,
  ComicWriterSelectSchema,
  ComicBookHistorySelectSchema
} from "./database.schema.ts";
import { MetadataSchema } from "./comicMetadata.schema.ts";

/**
 * Schemas for comic books
 * Including the main ComicBookSchema which extends the base ComicBookSelectSchema with additional fields for metadata and thumbnails, as well as any other relevant information we want to include in the API responses for comic books.
 * #DEPRECATED
 */
export const ComicBookSchema: z.ZodObject = ComicBookSelectSchema.extend({
  metadata: MetadataSchema.optional(),
  thumbnails: z.array(ComicBookThumbnailSelectSchema).optional(),
  thumbnailUrl: z.url().openapi({
    description: "URL to the primary thumbnail image for the comic book",
    example: "https://example.com/image/thumbnails/cover123.jpg",
  }).optional(),
}).openapi({
  title: "ComicBook",
  description:
    "Schema representing a comic book, including optional metadata and thumbnails",
});

/**
 * Basic schema for defining the reading status of a comic book for a user
 */
export const ComicBookReadingHistorySchema = z.object({
  read: z.boolean().openapi({
    description: "Indicates whether the comic book has been marked as read by the user",
    example: true,
  }),
  lastReadPage: z.number().optional().openapi({
    description: "The last page number that the user read in the comic book",
    example: 42,
  }),
})

/**
 * Schema for representing the level metadata for comic books, including letters, years, languages, formats, reading directions, age ratings, library IDs, manga flag, black and white flag, and series names.
 */
export const ComicBookLevelMetadataSchema = z.object({
  letters: z.array(z.string()).optional(),
  years: z.array(z.number()).optional(),
  languages: z.array(z.string()).optional(),
  formats: z.array(z.string()).optional(),
  readingDirections: z.array(z.string()).optional(),
  ageRatings: z.array(z.string()).optional(),
  libraryIds: z.array(z.number()).optional(),
  manga: z.array(z.number()).optional(),
  blackAndWhite: z.array(z.number()).optional(),
  seriesNames: z.array(z.string()).optional(),
}).openapi({
  title: "ComicBookLevelMetadata",
  description:
    "Schema representing the level metadata for comic books, including letters, years, languages, formats, reading directions, age ratings, library IDs, manga flag, black and white flag, and series names",
});


/**
 * ComicBookThumbnailsSchema is a separate schema to represent just the thumbnail information for a comic book, 
 * which can be used in cases where we want to return or update only the thumbnail data without needing to include all the other comic book fields. 
 * 
 * It includes an array of thumbnail records and an optional primary thumbnail URL, 
 * with appropriate OpenAPI metadata for documentation purposes.
 */
export const ComicBookThumbnailsSchema = z.object({
  thumbnails: z.array(ComicBookThumbnailSelectSchema).optional(),
  thumbnailUrl: z.url().openapi({
    description: "URL to the primary thumbnail image for the comic book",
    example: "https://example.com/image/thumbnails/cover123.jpg",
  }).optional(),
}).openapi({
  title: "ComicBookThumbnails",
  description: "Schema representing the thumbnail images associated with a comic book",
});

export const ComicBookCreatorContentSchema = z.object({
  writers: z.array(ComicWriterSelectSchema).optional(),
  pencilers: z.array(ComicPencilerSelectSchema).optional(),
  inkers: z.array(ComicInkerSelectSchema).optional(),
  letterers: z.array(ComicLettererSelectSchema).optional(),
  editors: z.array(ComicEditorSelectSchema).optional(),
  colorists: z.array(ComicColoristSelectSchema).optional(),
  coverArtists: z.array(ComicCoverArtistSelectSchema).optional(),
  publishers: z.array(ComicPublisherSelectSchema).optional(),
  imprints: z.array(ComicImprintSelectSchema).optional(),
  genres: z.array(ComicGenreSelectSchema).optional(),
  characters: z.array(ComicCharacterSelectSchema).optional(),
  locations: z.array(ComicLocationSelectSchema).optional(),
  teams: z.array(ComicTeamSelectSchema).optional(),
  storyArcs: z.array(ComicStoryArcSelectSchema).optional(),
  seriesGroups: z.array(ComicSeriesGroupSelectSchema).optional(),
}).openapi({
  title: "ComicBookCreatorContent",
  description:
    "Schema representing the creator and related content metadata for a comic book, including writers, pencilers, inkers, letterers, editors, colorists, cover artists, publishers, imprints, genres, characters, locations, teams, story arcs, and series groups",
});

export const ComicBookFilterValuesSchema = ComicBookCreatorContentSchema.extend(ComicBookLevelMetadataSchema.shape).openapi({
  title: "ComicBookFilterValues",
  description:
    "Schema representing the combined filter values for comic books, including creator content metadata and level metadata",
});

export const ComicBookWithMetadataSchema = ComicBookSelectSchema
  .extend(ComicBookCreatorContentSchema.shape)
  .extend(ComicBookThumbnailsSchema.shape)
  .extend(ComicBookReadingHistorySchema.shape)
  .openapi({
  title: "ComicBookWithMetadata",
  description:
    "Schema representing a comic book with detailed metadata about its creators and related content",
});