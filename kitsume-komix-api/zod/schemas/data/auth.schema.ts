import { z } from "@hono/zod-openapi";

/**
 * Schemas for authentication-related data
 * Including the AuthRefreshToken and AuthAccessToken schemas which represent the structure of refresh and access tokens used in the authentication process.
 */
export const AuthRefreshToken = z.string().openapi({
  title: "AuthRefreshToken",
  description: "A refresh token used for obtaining new access tokens",
  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
});

/**
 * Schema for access tokens used in authentication
 * Represents the structure of an access token, which is a string used for authenticating API requests.
 */
export const AuthAccessToken = z.string().openapi({
  title: "AuthAccessToken",
  description: "An access token used for authenticating API requests",
  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
});