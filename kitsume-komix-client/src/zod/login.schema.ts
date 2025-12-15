import { z } from 'zod';
import { toTypedSchema } from '@vee-validate/zod';

export const validateEmailPassword = toTypedSchema(
  z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" })
  })
);