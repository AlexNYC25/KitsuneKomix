import { z } from "@hono/zod-openapi";

export const AuthHeaderSchema = z.object({
  authorization: z.string().openapi({
    example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    description: "Bearer token for authentication",
  }),
});
