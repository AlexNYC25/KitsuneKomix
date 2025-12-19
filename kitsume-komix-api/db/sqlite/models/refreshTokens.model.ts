import { and, eq, gte, lt } from "drizzle-orm";
import { getClient } from "../client.ts";
import { refreshTokensTable } from "../schema.ts";

export interface RefreshToken {
  id: number;
  userId: number;
  tokenId: string;
  expiresAt: string;
  revoked: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRefreshTokenInput {
  userId: number;
  tokenId: string;
  expiresAt: string;
}

/**
 * Stores a refresh token in the database
 */
export async function storeRefreshToken(
  tokenData: CreateRefreshTokenInput,
): Promise<number> {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  const result = await db
    .insert(refreshTokensTable)
    .values(tokenData)
    .returning({ id: refreshTokensTable.id });

  return result[0].id;
}

/**
 * Retrieves a valid (non-revoked, non-expired) refresh token by token ID
 */
export async function getValidRefreshToken(
  tokenId: string,
): Promise<RefreshToken | null> {
  const { db } = getClient();
  const currentTime = new Date().toISOString();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  const result = await db
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
 */
export async function revokeRefreshToken(tokenId: string): Promise<boolean> {
  const { db } = getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  const result = await db
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
 */
export async function revokeAllUserRefreshTokens(
  userId: number,
): Promise<number> {
  const { db } = getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  const result = await db
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
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const { db } = getClient();
  const currentTime = new Date().toISOString();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  const result = await db
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
 */
export async function getUserActiveRefreshTokens(
  userId: number,
): Promise<RefreshToken[]> {
  const { db } = getClient();
  const currentTime = new Date().toISOString();

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
