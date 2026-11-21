import { z } from "zod";

export const standardEnvSchema = z.object({
  ENV: z.enum(["development", "test", "production"]),
});