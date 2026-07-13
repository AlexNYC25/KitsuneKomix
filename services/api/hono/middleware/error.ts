import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";

export const errorLogger = (err: Error, c: Context) => {
  const requestId = c.get("requestId") ?? "unknown";

  if (err instanceof HTTPException) {
    //apiLogger.warn({ requestId, status: err.status }, err.message);
    return c.json({ error: err.message }, err.status);
  }
  //apiLogger.error({ requestId, stack: err.stack }, "Unhandled error");
  return c.json({ error: "Internal Server Error", requestId }, 500);
}