import { z } from "zod";

import { StandardizedComicMetadata } from "#interfaces/index.ts";

import { ComicBookPagesInfoResponseSchema } from "#zod/schemas/response.schema.ts";

export type ComicBookPagesInfo = z.infer<typeof ComicBookPagesInfoResponseSchema>;

export type ComicMetadataPage = NonNullable<StandardizedComicMetadata["pages"]>[number];
export type CoverPageRecord = { pageId: number; imagePath: string; pageNumber: number };