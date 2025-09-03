import { z } from "zod";

export const ComicLibrarySchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1).max(100),
  description: z.string().max(255).nullable().optional(),
  path: z.string().min(1).max(255),
  enabled: z.boolean()
});