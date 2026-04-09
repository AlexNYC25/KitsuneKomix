import type { z } from "zod";

import type { InitialSetupCheckResponseSchema } from "#zod/schemas/response.schema.ts";

import type { JWTPayload } from "jose";
/**
 * Claims included in the access token JWT.
 */
export type AccessClaims = {
  sub: string;
  roles?: string[];
  scope?: string;
};

/**
 * Claims included in the refresh token JWT.
 */
export type RefreshClaims = {
  sub: string;
  type: "refresh";
  jti: string; // JWT ID for refresh token tracking
};

export type AccessRefreshTokenCombinedPayload = AccessClaims & JWTPayload;

/**
 * AppEnv type to include user information in the environment variables.
 * Important for setting up Hono+OpenApi routes with authentication context.
 */
export type AppEnv = {
  Variables: {
    user?: AccessClaims & JWTPayload;
  };
};

/**
 * Type to represent whether the admin account has been set up or not. 
 * Used for inital set up flow to determine if initial admin account creation is needed.
 */
export type AdminSetUp = z.infer<typeof InitialSetupCheckResponseSchema>;