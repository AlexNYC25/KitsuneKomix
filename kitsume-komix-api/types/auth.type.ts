import type { AccessClaims } from "../auth/auth.ts";
import type { JWTPayload } from "jose";

/**
 * AppEnv type to include user information in the environment variables.
 * Important for setting up Hono+OpenApi routes with authentication context.
 */
export type AppEnv = {
  Variables: {
    user?: AccessClaims & JWTPayload;
  };
};
