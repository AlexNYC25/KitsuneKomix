import { z } from "@hono/zod-openapi";

import { QueueNames } from "kitsune-komix-database";

export const queueJobStatusSchema = z.object({
	id: z.number(),
	queue: z.string(),
	state: z.enum(["pending", "processing", "dead"]),
	filePath: z.string().nullable(),
	payload: z.record(z.string(), z.unknown()),
	workerId: z.string().nullable(),
	attempts: z.number(),
	maxAttempts: z.number(),
	createdAt: z.number(),
	runAt: z.number(),
	claimExpiresAt: z.number().nullable(),
	lastError: z.string().nullable(),
});

export const queueOverviewEntrySchema = z.object({
	queue: z.string(),
	pending: z.number(),
	processing: z.number(),
	dead: z.number(),
	activeWorkers: z.array(
		z.object({
			workerId: z.string(),
			activeJobs: z.number(),
		}),
	),
});

export const queueErrorSchema = z.object({
	error: z.string(),
});

export const jobsQuerySchema = z.object({
	state: z.enum(["pending", "processing", "dead"]).optional(),
	queue: z.enum(Object.values(QueueNames)).optional(),
	worker: z.string().optional(),
	limit: z.coerce.number().int().positive().max(200).default(50),
	offset: z.coerce.number().int().nonnegative().default(0),
});