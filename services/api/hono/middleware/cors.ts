import { cors } from "hono/cors";

import { env } from "../../config/env"


export const honoCors = cors({
  origin: env.CLIENT_URL,
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "DELETE"],
  allowHeaders: ["Content-Type", "Authorization"],
  exposeHeaders: ["Content-Disposition", "Content-Length", "Content-Type"],
})