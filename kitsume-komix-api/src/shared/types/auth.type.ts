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
