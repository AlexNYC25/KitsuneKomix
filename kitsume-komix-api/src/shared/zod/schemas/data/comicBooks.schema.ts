import { z } from "zod";

import {
  ComicBookSelectSchema, // ComicBook
  ComicBookThumbnailSelectSchema,
  ComicWriterSelectSchema,
  ComicBookPencilerSelectSchema,
  ComicBookInkerSelectSchema,
  ComicBookLettererSelectSchema,
  ComicBookEditorSelectSchema,
  ComicBookColoristSelectSchema,
  ComicBookCoverArtistSelectSchema,
  ComicBookPublisherSelectSchema,
  ComicBookImprintSelectSchema,
  ComicBookGenreSelectSchema,
  ComicBookCharacterSelectSchema,
  ComicBookLocationSelectSchema,
  ComicBookTeamSelectSchema,
  ComicBookStoryArcSelectSchema,
  ComicBookSeriesGroupSelectSchema,
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
  pencilers: z.array(ComicBookPencilerSelectSchema).optional(),
  inkers: z.array(ComicBookInkerSelectSchema).optional(),
  letterers: z.array(ComicBookLettererSelectSchema).optional(),
  editors: z.array(ComicBookEditorSelectSchema).optional(),
  colorists: z.array(ComicBookColoristSelectSchema).optional(),
  coverArtists: z.array(ComicBookCoverArtistSelectSchema).optional(),
  publishers: z.array(ComicBookPublisherSelectSchema).optional(),
  imprints: z.array(ComicBookImprintSelectSchema).optional(),
  genres: z.array(ComicBookGenreSelectSchema).optional(),
  characters: z.array(ComicBookCharacterSelectSchema).optional(),
  locations: z.array(ComicBookLocationSelectSchema).optional(),
  teams: z.array(ComicBookTeamSelectSchema).optional(),
  storyArcs: z.array(ComicBookStoryArcSelectSchema).optional(),
  seriesGroups: z.array(ComicBookSeriesGroupSelectSchema).optional(),
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

export const ComicBookWithMetadataSchema = ComicBookSelectSchema.extend(ComicBookCreatorContentSchema.shape).extend(ComicBookThumbnailsSchema.shape).openapi({
  title: "ComicBookWithMetadata",
  description:
    "Schema representing a comic book with detailed metadata about its creators and related content",
});