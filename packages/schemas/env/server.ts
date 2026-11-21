import { z } from "zod";

export const serverEnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
})