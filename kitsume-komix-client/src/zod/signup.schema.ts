import { z } from 'zod';
import { toTypedSchema } from '@vee-validate/zod';

export const validateSignup = toTypedSchema(
  z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters long')
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
);
