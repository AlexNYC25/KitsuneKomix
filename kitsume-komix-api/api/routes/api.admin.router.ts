import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

import { purgeAllData } from "../../db/sqlite/models/admin.model.ts";

const app = new OpenAPIHono();

const MessageResponseSchema = z.object({
  message: z.string(),
});

const purgeDataRoute = createRoute({
  method: "post",
  path: "/purge-data",
  summary: "Purge all data",
  description: "Delete all data from the system (admin only)",
  tags: ["Admin"],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: MessageResponseSchema,
        },
      },
      description: "All data purged successfully",
    },
  },
});

app.openapi(purgeDataRoute, async (c) => {
  await purgeAllData();

  return c.json({ message: "All data purged successfully" }, 200);
});

export default app;
