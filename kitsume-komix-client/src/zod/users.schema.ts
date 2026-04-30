import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";

export const userSignUpSchema = toTypedSchema(z.object({
	userEmail: z.email('Invalid email address'),
	userRole: z.union([z.literal('user'), z.literal('admin')]),
	userPassword: z.string().min(6, 'Password must be at least 6 characters long')
}))

export const userInfoEditSchema = toTypedSchema(z.object({
	userEmail: z.email('Invalid email address'),
	userRole: z.union([z.literal('user'), z.literal('admin')]).optional(),
}))