import { and, eq, gte, isNull, lt } from "drizzle-orm";

import { getClient } from "../drizzle/client.ts";
import { refreshTokensTable } from "../schemas/index.ts";

import type { CreateRefreshTokenInput, RefreshToken, DrizzleType } from "../shared/types/index.ts";

/**
 * Stores a new refresh token in the database
 * @param tokenData The refresh token data to store
 * @returns The ID of the newly created refresh token
 */
export async function storeRefreshToken(
  tokenData: CreateRefreshTokenInput,
): Promise<number> {
  const db: DrizzleType = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  const result: { id: number }[] = await db
    .insert(refreshTokensTable)
    .values(tokenData)
    .returning({ id: refreshTokensTable.id });

  if (!result[0]) {
    throw new Error("No record returned when inserting refresh token.");
  }

  return result[0].id;
}

/**
 * Retrieves a refresh token by its hash regardless of state
 * @param tokenHash The SHA-256 hash of the refresh token
 * @returns The RefreshToken object or null if not found
 */
export async function getRefreshTokenByHash(
  tokenHash: string,
): Promise<RefreshToken | null> {
  const db: DrizzleType = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  const result: RefreshToken[] = await db
    .select()
    .from(refreshTokensTable)
    .where(eq(refreshTokensTable.tokenHash, tokenHash))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Retrieves a valid (non-revoked, non-expired) refresh token by its hash
 * @param tokenHash The SHA-256 hash of the refresh token
 * @returns The valid RefreshToken object or null if not found
 */
export async function getValidRefreshTokenByHash(
  tokenHash: string,
): Promise<RefreshToken | null> {
  const db: DrizzleType = await getClient();
  const currentTime: string = new Date().toISOString();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  const result: RefreshToken[] = await db
    .select()
    .from(refreshTokensTable)
    .where(
      and(
        eq(refreshTokensTable.tokenHash, tokenHash),
        isNull(refreshTokensTable.revokedAt),
        gte(refreshTokensTable.expiresAt, currentTime),
      ),
    )
    .limit(1);

  return result[0] ?? null;
}

/**
 * Revokes a refresh token by setting its revoked timestamp
 * @param tokenHash The SHA-256 hash of the token to revoke
 * @returns True if a token was revoked, false otherwise
 */
export async function revokeRefreshTokenByHash(
  tokenHash: string,
): Promise<boolean> {
  const db: DrizzleType = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  const result: { id: number }[] = await db
    .update(refreshTokensTable)
    .set({
      revokedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(refreshTokensTable.tokenHash, tokenHash))
    .returning({ id: refreshTokensTable.id });

  return result.length > 0;
}

/**
 * Revokes every token in a refresh token family. Used when a revoked token is
 * presented for rotation (token reuse detection) or to sign out a device fully.
 * @param familyId The family ID shared by a rotation chain
 * @returns The number of tokens revoked
 */
export async function revokeRefreshTokenFamily(
  familyId: string,
): Promise<number> {
  const db: DrizzleType = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  const result: { id: number }[] = await db
    .update(refreshTokensTable)
    .set({
      revokedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .where(
      and(eq(refreshTokensTable.familyId, familyId), isNull(refreshTokensTable.revokedAt)),
    )
    .returning({ id: refreshTokensTable.id });

  return result.length;
}

/**
 * Revokes all active refresh tokens for a specific user (logout all devices)
 * @param userId The user ID whose tokens should be revoked
 * @returns The number of tokens revoked
 */
export async function revokeAllUserRefreshTokens(
  userId: number,
): Promise<number> {
  const db: DrizzleType = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  const result: { id: number }[] = await db
    .update(refreshTokensTable)
    .set({
      revokedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .where(
      and(eq(refreshTokensTable.userId, userId), isNull(refreshTokensTable.revokedAt)),
    )
    .returning({ id: refreshTokensTable.id });

  return result.length;
}

/**
 * Revokes all active refresh tokens belonging to a session
 * @param sessionId The session ID whose tokens should be revoked
 * @returns The number of tokens revoked
 */
export async function revokeAllSessionRefreshTokens(
  sessionId: number,
): Promise<number> {
  const db: DrizzleType = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  const result: { id: number }[] = await db
    .update(refreshTokensTable)
    .set({
      revokedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .where(
      and(eq(refreshTokensTable.sessionId, sessionId), isNull(refreshTokensTable.revokedAt)),
    )
    .returning({ id: refreshTokensTable.id });

  return result.length;
}

/**
 * Marks a refresh token as used (bumps last_used_at)
 * @param tokenHash The SHA-256 hash of the refresh token
 * @returns True if the token was updated, false otherwise
 */
export async function touchRefreshToken(
  tokenHash: string,
): Promise<boolean> {
  const db: DrizzleType = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  const result: { id: number }[] = await db
    .update(refreshTokensTable)
    .set({ lastUsedAt: new Date().toISOString() })
    .where(eq(refreshTokensTable.tokenHash, tokenHash))
    .returning({ id: refreshTokensTable.id });

  return result.length > 0;
}

/**
 * Cleanup expired or revoked refresh tokens from the database
 * @returns The number of tokens deleted
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const db: DrizzleType = await getClient();
  const currentTime: string = new Date().toISOString();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  const result: { id: number }[] = await db
    .delete(refreshTokensTable)
    .where(lt(refreshTokensTable.expiresAt, currentTime))
    .returning({ id: refreshTokensTable.id });

  return result.length;
}

/**
 * Get all active refresh tokens for a user (for admin/debugging purposes)
 * @param userId The user ID to fetch tokens for
 * @returns An array of active RefreshToken objects
 */
export async function getUserActiveRefreshTokens(
  userId: number,
): Promise<RefreshToken[]> {
  const db: DrizzleType = await getClient();
  const currentTime: string = new Date().toISOString();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  return await db
    .select()
    .from(refreshTokensTable)
    .where(
      and(
        eq(refreshTokensTable.userId, userId),
        isNull(refreshTokensTable.revokedAt),
        gte(refreshTokensTable.expiresAt, currentTime),
      ),
    );
}