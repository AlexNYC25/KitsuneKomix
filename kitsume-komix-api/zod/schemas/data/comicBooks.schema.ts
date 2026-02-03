import { z } from "@hono/zod-openapi";

import { comicBooksTable } from "../../../db/sqlite/schema.ts";
import { createSelectSchema } from "../../factory.ts";
import { toCamelCaseSchema } from "../../utils/openapi-helpers.ts";
import {
  comicWritersTable,
  comicPencillersTable,
  comicInkersTable,
  comicLetterersTable,
  comicEditorsTable,
  comicColoristsTable,
  comicCoverArtistsTable,
  comicPublishersTable,
  comicImprintsTable,
  comicGenresTable,
  comicCharactersTable,
  comicTeamsTable,
  comicLocationsTable,
  comicStoryArcsTable,
  comicSeriesGroupsTable,
} from "../../../db/sqlite/schema.ts";

/**
 * Schemas for comic books
 * 
 * Direct schema from the comicBooksTable
 */
export const comicBookSelectSchema: z.ZodObject = createSelectSchema(
  comicBooksTable,
)

/**
 * Schema for comic books joined with their thumbnail URL
 * 
 * Extends the base comic book schema with a nullable thumbnailUrl field
 */
export const comicBookSelectJoinedWithThumbnailSchema = createSelectSchema(
  comicBooksTable,
)
.extend({
  thumbnailUrl: z.string().nullable().optional(),
})

/**
 * CamelCase version for OpenAPI compatibility of the comic book with thumbnail schema
 */
export const comicBookSelectJoinedWithThumbnailCamelCaseSchema = toCamelCaseSchema(
  comicBookSelectJoinedWithThumbnailSchema,
  {
    title: "ComicBookWithThumbnail",
    description: "A comic book with its thumbnail URL in camelCase format",
  }
);

// Create small select schemas for related metadata tables and convert them to camelCase for responses
const comicWriterCamelCase = toCamelCaseSchema(
  createSelectSchema(comicWritersTable),
  { title: "ComicWriter", description: "Writer object in camelCase" },
);

const comicPencillerCamelCase = toCamelCaseSchema(
  createSelectSchema(comicPencillersTable),
  { title: "ComicPenciller", description: "Penciller object in camelCase" },
);

const comicInkerCamelCase = toCamelCaseSchema(
  createSelectSchema(comicInkersTable),
  { title: "ComicInker", description: "Inker object in camelCase" },
);

const comicLettererCamelCase = toCamelCaseSchema(
  createSelectSchema(comicLetterersTable),
  { title: "ComicLetterer", description: "Letterer object in camelCase" },
);

const comicEditorCamelCase = toCamelCaseSchema(
  createSelectSchema(comicEditorsTable),
  { title: "ComicEditor", description: "Editor object in camelCase" },
);

const comicColoristCamelCase = toCamelCaseSchema(
  createSelectSchema(comicColoristsTable),
  { title: "ComicColorist", description: "Colorist object in camelCase" },
);

const comicCoverArtistCamelCase = toCamelCaseSchema(
  createSelectSchema(comicCoverArtistsTable),
  { title: "ComicCoverArtist", description: "Cover artist object in camelCase" },
);

const comicPublisherCamelCase = toCamelCaseSchema(
  createSelectSchema(comicPublishersTable),
  { title: "ComicPublisher", description: "Publisher object in camelCase" },
);

const comicImprintCamelCase = toCamelCaseSchema(
  createSelectSchema(comicImprintsTable),
  { title: "ComicImprint", description: "Imprint object in camelCase" },
);

const comicGenreCamelCase = toCamelCaseSchema(
  createSelectSchema(comicGenresTable),
  { title: "ComicGenre", description: "Genre object in camelCase" },
);

const comicCharacterCamelCase = toCamelCaseSchema(
  createSelectSchema(comicCharactersTable),
  { title: "ComicCharacter", description: "Character object in camelCase" },
);

const comicTeamCamelCase = toCamelCaseSchema(
  createSelectSchema(comicTeamsTable),
  { title: "ComicTeam", description: "Team object in camelCase" },
);

const comicLocationCamelCase = toCamelCaseSchema(
  createSelectSchema(comicLocationsTable),
  { title: "ComicLocation", description: "Location object in camelCase" },
);

const comicStoryArcCamelCase = toCamelCaseSchema(
  createSelectSchema(comicStoryArcsTable),
  { title: "ComicStoryArc", description: "Story arc object in camelCase" },
);

const comicSeriesGroupCamelCase = toCamelCaseSchema(
  createSelectSchema(comicSeriesGroupsTable),
  { title: "ComicSeriesGroup", description: "Series group object in camelCase" },
);

// Schema for a ComicBook with attached metadata arrays
export const comicBookWithMetadataCamelCaseSchema =
  comicBookSelectJoinedWithThumbnailCamelCaseSchema.extend({
    writers: z.array(comicWriterCamelCase).optional(),
    pencillers: z.array(comicPencillerCamelCase).optional(),
    inkers: z.array(comicInkerCamelCase).optional(),
    letterers: z.array(comicLettererCamelCase).optional(),
    editors: z.array(comicEditorCamelCase).optional(),
    colorists: z.array(comicColoristCamelCase).optional(),
    coverArtists: z.array(comicCoverArtistCamelCase).optional(),
    publishers: z.array(comicPublisherCamelCase).optional(),
    imprints: z.array(comicImprintCamelCase).optional(),
    genres: z.array(comicGenreCamelCase).optional(),
    characters: z.array(comicCharacterCamelCase).optional(),
    teams: z.array(comicTeamCamelCase).optional(),
    locations: z.array(comicLocationCamelCase).optional(),
    storyArcs: z.array(comicStoryArcCamelCase).optional(),
    seriesGroups: z.array(comicSeriesGroupCamelCase).optional(),
  });
