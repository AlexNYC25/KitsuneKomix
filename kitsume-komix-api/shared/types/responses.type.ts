import { z } from "zod";
import {
  ComicBookMultipleResponseSchema,
  ComicSeriesMultipleResponseSchema,
} from "#schemas/response.schema.ts";

export type ComicBookMultipleResponse = z.infer<
  typeof ComicBookMultipleResponseSchema
>;
export type ComicBookMultipleResponseData = ComicBookMultipleResponse["data"];
export type ComicBookMultipleResponseMeta = ComicBookMultipleResponse["meta"];

export type ComicSeriesMultipleResponse = z.infer<
  typeof ComicSeriesMultipleResponseSchema
>;
export type ComicSeriesMultipleResponseData =
  ComicSeriesMultipleResponse["data"];
export type ComicSeriesMultipleResponseMeta =
  ComicSeriesMultipleResponse["meta"];
