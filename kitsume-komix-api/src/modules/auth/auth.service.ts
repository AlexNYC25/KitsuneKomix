import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

import { getUserByEmail, getUserById } from "#infrastructure/db/sqlite/models/users.model.ts";
import {
  cleanupExpiredTokens,
  getValidRefreshToken,
  revokeAllUserRefreshTokens,
  revokeRefreshToken,
  storeRefreshToken,
} from "#infrastructure/db/sqlite/models/refreshTokens.model.ts";

import { generateTokenPair, verifyRefreshToken } from "./jwt.service.ts";

import { verifyPassword } from "#utilities/hash.ts";

import {
  env
} from "#config/env.ts";

import { User } from "#types/index.ts";
import { RefreshTokenResponse, TokenPair } from "#interfaces/index.ts";

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

  return { id: user.id, email: user.email, admin: user.admin };
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
    httpOnly: env.COOKIE_HTTP_ONLY,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  } as const;

  // Access token: short-lived, available to all API paths.
  setCookie(c, env.ACCESS_COOKIE_NAME, accessToken, {
    ...sharedOptions,
    path: env.COOKIE_PATH,
    maxAge: env.ACCESS_COOKIE_MAX_AGE_SECONDS,
  });

  // Refresh token: long-lived, scoped to auth endpoints only.
  setCookie(c, env.REFRESH_COOKIE_NAME, refreshToken, {
    ...sharedOptions,
    path: env.REFRESH_COOKIE_PATH,
    maxAge: env.REFRESH_COOKIE_MAX_AGE_SECONDS,
  });
};

/**
 * Clears both auth cookies from the response. Should be called on logout.
 *
 * @param c - Hono request context.
 */
export const clearAuthCookies = (c: Context): void => {
  const sharedOptions = {
    secure: env.COOKIE_SECURE,
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  } as const;

  deleteCookie(c, env.ACCESS_COOKIE_NAME, {
    ...sharedOptions,
    path: env.COOKIE_PATH,
  });

  deleteCookie(c, env.REFRESH_COOKIE_NAME, {
    ...sharedOptions,
    path: env.REFRESH_COOKIE_PATH,
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

/**
 * Creates and stores a new refresh token pair for a user
 */
export async function createRefreshTokenPair(
  userId: number,
  roles?: string[],
): Promise<TokenPair> {
  // Generate the token pair
  const { accessToken, refreshToken, refreshTokenId } = await generateTokenPair(
    userId.toString(),
    roles,
  );

  // Calculate expiration time (7 days from now by default)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Store the refresh token in the database
  await storeRefreshToken({
    userId: userId,
    tokenId: refreshTokenId,
    expiresAt: expiresAt.toISOString(),
  });

  return {
    accessToken,
    refreshToken,
  };
}

/**
 * Refreshes an access token using a valid refresh token
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<RefreshTokenResponse> {
  try {
    // Verify the refresh token JWT
    const payload = await verifyRefreshToken(refreshToken);

    // Check if the refresh token exists and is valid in the database
    const storedToken = await getValidRefreshToken(payload.jti);
    if (!storedToken) {
      throw new Error("Refresh token not found or expired");
    }

    // Generate a new token pair
    const userId = parseInt(payload.sub);

    // For simplicity, we'll use empty roles array here
    // In a real app, you'd fetch user roles from the database
    const newTokenPair = await createRefreshTokenPair(userId);

    // Revoke the old refresh token
    await revokeRefreshToken(payload.jti);

    return {
      accessToken: newTokenPair.accessToken,
      refreshToken: newTokenPair.refreshToken,
    };
  } catch (error) {
    throw new Error(
      `Invalid refresh token: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

/**
 * Revokes a specific refresh token (for logout)
 */
export async function revokeToken(refreshToken: string): Promise<boolean> {
  try {
    const payload = await verifyRefreshToken(refreshToken);
    return await revokeRefreshToken(payload.jti);
  } catch (error) {
    // Even if token is invalid, we return true since the goal is achieved
    return true;
  }
}

/**
 * Revokes all refresh tokens for a user (for logout from all devices)
 */
export async function revokeAllUserTokens(userId: number): Promise<number> {
  return await revokeAllUserRefreshTokens(userId);
}

/**
 * Cleanup expired tokens (can be run as a scheduled job)
 */
export async function cleanupExpiredRefreshTokens(): Promise<number> {
  return await cleanupExpiredTokens();
}

const getUserRoles = async (userId: number): Promise<string[]> => {
  const user = await getUserById(userId);
  if (!user) {
    return [];
  }

  if(user.admin) {
    return ["admin", "user"];
  }

  return ["user"];
};


/**
 * Enhanced refresh with user roles from database
 * This is a more complete version that fetches user data
 */
export async function refreshAccessTokenWithUserData(
  refreshToken: string
): Promise<RefreshTokenResponse> {
  try {
    // Verify the refresh token JWT
    const payload = await verifyRefreshToken(refreshToken);

    // Check if the refresh token exists and is valid in the database
    const storedToken = await getValidRefreshToken(payload.jti);
    if (!storedToken) {
      throw new Error("Refresh token not found or expired");
    }

    // Get fresh user data and roles
    const userId = parseInt(payload.sub);
    const userRoles = await getUserRoles(userId);

    // Generate a new token pair with current user roles
    const newTokenPair = await createRefreshTokenPair(userId, userRoles);

    // Revoke the old refresh token
    await revokeRefreshToken(payload.jti);

    return {
      accessToken: newTokenPair.accessToken,
      refreshToken: newTokenPair.refreshToken,
    };
  } catch (error) {
    throw new Error(
      `Invalid refresh token: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
