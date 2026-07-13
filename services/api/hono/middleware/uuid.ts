import { randomUUIDv7 } from "bun"
import type { Context, Next } from "hono";

export const requestUUID = async (c: Context, next: Next) => {
  const requestId = randomUUIDv7()
  c.set("requestID", requestId);
  await next()
}