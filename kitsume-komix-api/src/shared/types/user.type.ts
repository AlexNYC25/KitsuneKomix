import type { z } from "zod";

import type { EditUserRequestSchema } from "#zod/schemas/request.schema.ts";

export type UserRegistrationInput = {
  email: string;
  password: string; // plain text from client
  firstName?: string;
  lastName?: string;
};

export type UserEditInput = z.infer<typeof EditUserRequestSchema>;