import { z } from 'zod';

export const userIdParamSchema = z.object({
	userId: z.coerce.number().int().positive(),
});

export const userDeletedSchema = z.object({
	deleted: z.boolean(),
});

export const userErrorSchema = z.object({
	error: z.string(),
});
