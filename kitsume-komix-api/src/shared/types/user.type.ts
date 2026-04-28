import type { z } from "zod";

import type { EditUserRequestSchema } from "#zod/schemas/request.schema.ts";
import type { UserInsertSchema } from "#zod/schemas/data/database.schema.ts";

export type UserRegistrationInput = z.infer<typeof UserInsertSchema>;

export type UserEditInput = z.infer<typeof EditUserRequestSchema>;