import { and, eq, gte, lt } from "drizzle-orm";

import { getClient } from "../client.ts";
import { refreshTokensTable } from "../schema.ts";

import { CreateRefreshTokenInput, RefreshToken } from "#interfaces/index.ts";

/**
 * Stores a new refresh token in the database
 * @param tokenData The refresh token data to store
 * @returns The ID of the newly created refresh token
 */
export async function storeRefreshToken(
  tokenData: CreateRefreshTokenInput,
): Promise<number> {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  const result: { id: number }[] = await db
    .insert(refreshTokensTable)
    .values(tokenData)
    .returning({ id: refreshTokensTable.id });

  return result[0].id;
}

/**
 * Retrieves a valid (non-revoked, non-expired) refresh token by token ID
 * @param tokenId The token ID to search for
 * @returns The valid RefreshToken object or null if not found
 */
export async function getValidRefreshToken(
  tokenId: string,
): Promise<RefreshToken | null> {
  const { db } = getClient();
  const currentTime: string = new Date().toISOString();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  const result: RefreshToken[] = await db
    .select()
    .from(refreshTokensTable)
    .where(
      and(
        eq(refreshTokensTable.tokenId, tokenId),
        eq(refreshTokensTable.revoked, 0),
        gte(refreshTokensTable.expiresAt, currentTime),
      ),
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Revokes a refresh token by setting revoked = 1
 * @param tokenId The token ID to revoke
 * @returns True if a token was revoked, false otherwise
 */
export async function revokeRefreshToken(tokenId: string): Promise<boolean> {
  const { db } = getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  const result: { id: number }[] = await db
    .update(refreshTokensTable)
    .set({
      revoked: 1,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(refreshTokensTable.tokenId, tokenId))
    .returning({ id: refreshTokensTable.id });

  return result.length > 0;
}

/**
 * Revokes all refresh tokens for a specific user (useful for logout all devices)
 * @param userId The user ID whose tokens should be revoked
 * @returns The number of tokens revoked
 */
export async function revokeAllUserRefreshTokens(
  userId: number,
): Promise<number> {
  const { db } = getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  const result: { id: number }[] = await db
    .update(refreshTokensTable)
    .set({
      revoked: 1,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(refreshTokensTable.userId, userId))
    .returning({ id: refreshTokensTable.id });

  return result.length;
}

/**
 * Cleanup expired refresh tokens from the database
 * @returns The number of tokens deleted
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const { db } = getClient();
  const currentTime: string = new Date().toISOString();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  const result: { id: number }[] = await db
    .delete(refreshTokensTable)
    .where(
      and(
        eq(refreshTokensTable.revoked, 0),
        lt(refreshTokensTable.expiresAt, currentTime),
      ),
    )
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
  const { db } = getClient();
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
        eq(refreshTokensTable.revoked, 0),
        gte(refreshTokensTable.expiresAt, currentTime),
      ),
    );
}
