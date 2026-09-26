import { OpenAPIHono } from "@hono/zod-openapi";

import { honoCors } from "./middleware/cors"
import { requestUUID } from "./middleware/uuid";
import { errorLogger } from "./middleware/error"

/**
 * Set up a new OpenAPIHono instance with the necessary middleware applied.
 * @param parent A boolean indicating whether the instance is a parent instance (true) or a child instance (false). If true, CORS and request ID middleware will be applied.
 * @returns 
 */
export const factory = (parent: boolean = false): OpenAPIHono<{Variables: {requestId: string}}> => {
  const app = new OpenAPIHono<{Variables: {requestId: string}}>();

  if (parent) {
    // CORS middleware must be registered BEFORE routes
    app.use("*", honoCors);
    
    // Request ID middleware — generates a UUID for each request for log correlation
    app.use("*", requestUUID);
  }

  return app;
}

/**
 * Applies final middleware to the provided OpenAPIHono instance, such as error logging.
 * @param app The OpenAPIHono instance to which the final middleware will be applied.
 */
export const finalMiddlewareApply = (app: OpenAPIHono<{Variables: {requestId: string}}>) => {
  // Error middleware - last to be set
  app.onError(errorLogger);
}