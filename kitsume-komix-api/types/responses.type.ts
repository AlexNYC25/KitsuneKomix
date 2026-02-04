import { z } from "zod";
import { ComicBookMultipleResponseSchema } from "#schemas/response.schema.ts";

export type ComicBookMultipleResponse = z.infer<typeof ComicBookMultipleResponseSchema>;
export type ComicBookMultipleResponseData = ComicBookMultipleResponse["data"];
export type ComicBookMultipleResponseMeta = ComicBookMultipleResponse["meta"];
