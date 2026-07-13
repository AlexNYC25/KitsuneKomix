import { OpenAPIHono } from "@hono/zod-openapi";

import { honoCors } from "./middleware/cors"
import { requestUUID } from "./middleware/uuid";
import { errorLogger } from "./middleware/error"

const app = new OpenAPIHono<{Variables: {requestId: string}}>();

// CORS middleware must be registered BEFORE routes
app.use("*", honoCors);

// Request ID middleware — generates a UUID for each request for log correlation
app.use("*", requestUUID);



// Error middleware - last to be set
app.onError(errorLogger);

export default app;