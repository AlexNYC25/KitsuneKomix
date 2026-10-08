import { createRoute } from "@hono/zod-openapi";

import { deleteUser } from "kitsune-komix-database";

import { factory } from "../../hono/factory";
import { requireAdmin } from "../../hono/middleware/auth";

import {
	userIdParamSchema,
	userDeletedSchema,
	userErrorSchema,
} from "./users.schema";

const deleteUserRoute = createRoute({
	method: "delete",
	path: "/:userId",
	request: {
		params: userIdParamSchema,
	},
	responses: {
		200: {
			description: "User deleted",
			content: {
				"application/json": { schema: userDeletedSchema },
			},
		},
		401: {
			description: "Unauthorized",
			content: {
				"application/json": { schema: userErrorSchema },
			},
		},
		403: {
			description: "Forbidden",
			content: {
				"application/json": { schema: userErrorSchema },
			},
		},
		404: {
			description: "User not found",
			content: {
				"application/json": { schema: userErrorSchema },
			},
		},
	},
});

const router = factory(false);

router.use("*", requireAdmin);

router.openapi(deleteUserRoute, async (c) => {
	const { userId } = c.req.valid("param");

	const result = await deleteUser(userId);

	if (!result.deleted) {
		return c.json({ error: "User not found" }, 404);
	}

	return c.json(result, 200);
});

export default router;
