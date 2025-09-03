import { z } from "zod";

export const UserSchema = z.object({
  id: z.number().int().positive().optional(),
  username: z.string().min(3).max(30),
  email: z.email(),
  password: z.string().min(8).max(100),
  first_name: z.string().max(50).nullable().optional(),
  last_name: z.string().max(50).nullable().optional(),
});


