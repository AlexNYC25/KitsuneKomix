import { and, eq, gte, isNull, lt } from "drizzle-orm";

import { getClient } from "../drizzle/client.ts";
import { dbLogger } from "../loggers/index.ts";
import { apiKeysTable } from "../schemas/index.ts";

import type { NewApiKey, ApiKey, DrizzleType } from "../shared/types/index.ts";

/**
 * Creates a new API key in the database
 * @param keyData The API key data including user_id, name and token_hash
 * @returns The ID of the newly created API key
 */
export const createApiKey = async (
  keyData: NewApiKey,
): Promise<number> => {
  const db: DrizzleType = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(apiKeysTable)
      .values(keyData)
      .returning({ id: apiKeysTable.id });

    if (!result[0]) {
      throw new Error("No record returned when inserting API key.");
    }

    return result[0].id;
  } catch (error) {
    dbLogger.error("Error creating API key:" + error);
    throw error;
  }
};

/**
 * Retrieves an API key by its hash regardless of state
 * @param tokenHash The SHA-256 hash of the API key
 * @returns The ApiKey object, or null if not found
 */
export const getApiKeyByHash = async (
  tokenHash: string,
): Promise<ApiKey | null> => {
  const db: DrizzleType = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ApiKey[] = await db
      .select()
      .from(apiKeysTable)
      .where(eq(apiKeysTable.tokenHash, tokenHash))
      .limit(1);

    return result[0] ?? null;
  } catch (error) {
    dbLogger.error("Error fetching API key by hash:" + error);
    throw error;
  }
};

/**
 * Retrieves a valid (non-revoked, non-expired) API key by its hash
 * @param tokenHash The SHA-256 hash of the API key
 * @returns The valid ApiKey object, or null if not found
 */
export const getValidApiKeyByHash = async (
  tokenHash: string,
): Promise<ApiKey | null> => {
  const db: DrizzleType = await getClient();
  const currentTime: string = new Date().toISOString();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ApiKey[] = await db
      .select()
      .from(apiKeysTable)
      .where(
        and(
          eq(apiKeysTable.tokenHash, tokenHash),
          isNull(apiKeysTable.revokedAt),
          gte(apiKeysTable.expiresAt, currentTime),
        ),
      )
      .limit(1);

    return result[0] ?? null;
  } catch (error) {
    dbLogger.error("Error fetching valid API key:" + error);
    throw error;
  }
};

/**
 * Revokes an API key by setting its revoked timestamp
 * @param id The API key ID
 * @returns True if the API key was revoked, false otherwise
 */
export const revokeApiKey = async (id: number): Promise<boolean> => {
  const db: DrizzleType = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .update(apiKeysTable)
      .set({
        revokedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(apiKeysTable.id, id))
      .returning({ id: apiKeysTable.id });

    return result.length > 0;
  } catch (error) {
    dbLogger.error("Error revoking API key:" + error);
    throw error;
  }
};

/**
 * Marks an API key as used (bumps last_used_at)
 * @param id The API key ID
 * @returns True if the API key was updated, false otherwise
 */
export const touchApiKey = async (id: number): Promise<boolean> => {
  const db: DrizzleType = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .update(apiKeysTable)
      .set({ lastUsedAt: new Date().toISOString() })
      .where(eq(apiKeysTable.id, id))
      .returning({ id: apiKeysTable.id });

    return result.length > 0;
  } catch (error) {
    dbLogger.error("Error touching API key:" + error);
    throw error;
  }
};

/**
 * Retrieves all API keys for a user
 * @param userId The user ID to fetch keys for
 * @returns An array of ApiKey objects
 */
export const listUserApiKeys = async (
  userId: number,
): Promise<ApiKey[]> => {
  const db: DrizzleType = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    return await db
      .select()
      .from(apiKeysTable)
      .where(eq(apiKeysTable.userId, userId));
  } catch (error) {
    dbLogger.error("Error listing user API keys:" + error);
    throw error;
  }
};

/**
 * Cleanup expired or revoked API keys from the database
 * @returns The number of API keys deleted
 */
export const cleanupExpiredApiKeys = async (): Promise<number> => {
  const db: DrizzleType = await getClient();
  const currentTime: string = new Date().toISOString();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .delete(apiKeysTable)
      .where(lt(apiKeysTable.expiresAt, currentTime))
      .returning({ id: apiKeysTable.id });

    return result.length;
  } catch (error) {
    dbLogger.error("Error cleaning up expired API keys:" + error);
    throw error;
  }
};