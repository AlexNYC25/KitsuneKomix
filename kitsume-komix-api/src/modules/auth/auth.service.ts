import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

import { getUserByEmail } from "#sqlite/models/users.model.ts";

import { verifyPassword } from "#utilities/hash.ts";
import { User } from "#types/index.ts";
import {
  ACCESS_COOKIE_MAX_AGE_SECONDS,
  ACCESS_COOKIE_NAME,
  COOKIE_DOMAIN,
  COOKIE_HTTP_ONLY,
  COOKIE_PATH,
  COOKIE_SAME_SITE,
  COOKIE_SECURE,
  REFRESH_COOKIE_MAX_AGE_SECONDS,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_PATH,
} from "#utilities/environment.ts";

/**
 * Authenticates a user by email and password.
 * @param email User's email address
 * @param password User's password
 * @returns The authenticated user's details if successful
 * @throws Error if authentication fails
 */
export const authenticateUser = async (
  email: string,
  password: string,
): Promise<{ id: number; email: string; admin: boolean }> => {
  const user: User | null = await getUserByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }

  // Verify the password (you should hash and compare in a real app)
  if (!(await verifyPassword(user.passwordHash, password))) {
    throw new Error("Invalid password");
  }

  return { id: user.id, email: user.email, admin: user.admin === 1 };
};

/**
 * Writes both the access-token and refresh-token as HttpOnly cookies on the
 * response. Should be called after a successful login or token rotation.
 *
 * @param c - Hono request context.
 * @param accessToken  - Signed access JWT.
 * @param refreshToken - Signed refresh JWT.
 */
export const setAuthCookies = (
  c: Context,
  accessToken: string,
  refreshToken: string,
): void => {
  const sharedOptions = {
    httpOnly: COOKIE_HTTP_ONLY,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAME_SITE,
    ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
  } as const;

  // Access token: short-lived, available to all API paths.
  setCookie(c, ACCESS_COOKIE_NAME, accessToken, {
    ...sharedOptions,
    path: COOKIE_PATH,
    maxAge: ACCESS_COOKIE_MAX_AGE_SECONDS,
  });

  // Refresh token: long-lived, scoped to auth endpoints only.
  setCookie(c, REFRESH_COOKIE_NAME, refreshToken, {
    ...sharedOptions,
    path: REFRESH_COOKIE_PATH,
    maxAge: REFRESH_COOKIE_MAX_AGE_SECONDS,
  });
};

/**
 * Clears both auth cookies from the response. Should be called on logout.
 *
 * @param c - Hono request context.
 */
export const clearAuthCookies = (c: Context): void => {
  const sharedOptions = {
    secure: COOKIE_SECURE,
    ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
  } as const;

  deleteCookie(c, ACCESS_COOKIE_NAME, {
    ...sharedOptions,
    path: COOKIE_PATH,
  });

  deleteCookie(c, REFRESH_COOKIE_NAME, {
    ...sharedOptions,
    path: REFRESH_COOKIE_PATH,
  });
};

/**
 * Reads a token string from a named cookie on the incoming request.
 * Returns `undefined` if the cookie is absent or empty.
 *
 * @param c    - Hono request context.
 * @param name - Cookie name to read (use the exported `*_COOKIE_NAME` constants).
 */
export const getTokenFromCookie = (
  c: Context,
  name: string,
): string | undefined => {
  const value = getCookie(c, name);
  return value && value.length > 0 ? value : undefined;
};
