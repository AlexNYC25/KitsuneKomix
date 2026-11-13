import { createRoute, z } from "@hono/zod-openapi";

import {
	getQueueJobs,
	getQueueOverview,
	QueueUnavailableError,
} from "kitsune-komix-database";

import { factory } from "../../hono/factory";
import { requireAdmin } from "../../hono/middleware/auth";

import {
	jobsQuerySchema,
	queueErrorSchema,
	queueJobStatusSchema,
	queueOverviewEntrySchema,
} from "./processing.schema";

const overviewRoute = createRoute({
	method: "get",
	path: "/overview",
	responses: {
		200: {
			description: "Per-queue processing overview",
			content: {
				"application/json": { schema: z.array(queueOverviewEntrySchema) },
			},
		},
		401: {
			description: "Unauthorized",
			content: {
				"application/json": { schema: queueErrorSchema },
			},
		},
		403: {
			description: "Forbidden",
			content: {
				"application/json": { schema: queueErrorSchema },
			},
		},
		503: {
			description: "Queue subsystem unavailable",
			content: {
				"application/json": { schema: queueErrorSchema },
			},
		},
	},
});

const jobsRoute = createRoute({
	method: "get",
	path: "/jobs",
	request: {
		query: jobsQuerySchema,
	},
	responses: {
		200: {
			description: "Paginated job list",
			content: {
				"application/json": {
					schema: z.object({
						total: z.number(),
						jobs: z.array(queueJobStatusSchema),
					}),
				},
			},
		},
		401: {
			description: "Unauthorized",
			content: {
				"application/json": { schema: queueErrorSchema },
			},
		},
		403: {
			description: "Forbidden",
			content: {
				"application/json": { schema: queueErrorSchema },
			},
		},
		503: {
			description: "Queue subsystem unavailable",
			content: {
				"application/json": { schema: queueErrorSchema },
			},
		},
	},
});

const router = factory(false);

router.use("*", requireAdmin);

router.openapi(overviewRoute, async (c) => {
	try {
		const overview = await getQueueOverview();

		return c.json(overview, 200);
	} catch (error) {
		if (error instanceof QueueUnavailableError) {
			return c.json({ error: error.message }, 503);
		}

		throw error;
	}
});

router.openapi(jobsRoute, async (c) => {
	const query = c.req.valid("query");

	try {
		const result = await getQueueJobs({
			state: query.state,
			queue: query.queue,
			workerId: query.worker,
			limit: query.limit,
			offset: query.offset,
		});

		return c.json(result, 200);
	} catch (error) {
		if (error instanceof QueueUnavailableError) {
			return c.json({ error: error.message }, 503);
		}

		throw error;
	}
});

export default router;
