import { z } from "zod";

export const AuthHeaderSchema = z.object({
  authorization: z.string().openapi({
    example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    description: "Bearer token for authentication",
  }),
});
