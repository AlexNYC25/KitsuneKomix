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

export const userPasswordEditSchema = toTypedSchema(
	z.object({
		newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
		confirmPassword: z.string().min(6, 'Password must be at least 6 characters long'),
	}).refine((values) => values.newPassword === values.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	}),
)