import { and, eq, gte, lt } from "drizzle-orm";

import { getClient } from "../drizzle/client.ts";
import { dbLogger } from "../loggers/index.ts";
import { sessionsTable } from "../schemas/index.ts";

import type { NewSession, Session, DrizzleType } from "../shared/types/index.ts";

/**
 * Creates a new session in the database
 * @param sessionData The session data including session_id, user_id and client_id
 * @returns The ID of the newly created session
 */
export const createSession = async (
  sessionData: NewSession,
): Promise<number> => {
  const db: DrizzleType = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(sessionsTable)
      .values(sessionData)
      .returning({ id: sessionsTable.id });

    if (!result[0]) {
      throw new Error("No record returned when inserting session.");
    }

    return result[0].id;
  } catch (error) {
    dbLogger.error("Error creating session:" + error);
    throw error;
  }
};

/**
 * Retrieves a session by its public session_id
 * @param sessionId The public session identifier
 * @returns The Session object, or null if not found
 */
export const getSessionBySessionId = async (
  sessionId: string,
): Promise<Session | null> => {
  const db: DrizzleType = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: Session[] = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.sessionId, sessionId))
      .limit(1);

    return result[0] ?? null;
  } catch (error) {
    dbLogger.error("Error fetching session by session_id:" + error);
    throw error;
  }
};

/**
 * Retrieves a valid (active, non-expired) session by its public session_id
 * @param sessionId The public session identifier
 * @returns The valid Session object, or null if not found
 */
export const getValidSession = async (
  sessionId: string,
): Promise<Session | null> => {
  const db: DrizzleType = await getClient();
  const currentTime: string = new Date().toISOString();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: Session[] = await db
      .select()
      .from(sessionsTable)
      .where(
        and(
          eq(sessionsTable.sessionId, sessionId),
          eq(sessionsTable.status, "active"),
          gte(sessionsTable.expiresAt, currentTime),
        ),
      )
      .limit(1);

    return result[0] ?? null;
  } catch (error) {
    dbLogger.error("Error fetching valid session:" + error);
    throw error;
  }
};

/**
 * Revokes a session by marking it revoked
 * @param sessionId The public session identifier
 * @returns True if the session was revoked, false otherwise
 */
export const revokeSession = async (
  sessionId: string,
): Promise<boolean> => {
  const db: DrizzleType = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .update(sessionsTable)
      .set({
        status: "revoked",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(sessionsTable.sessionId, sessionId))
      .returning({ id: sessionsTable.id });

    return result.length > 0;
  } catch (error) {
    dbLogger.error("Error revoking session:" + error);
    throw error;
  }
};

/**
 * Revokes all active sessions for a specific user (sign out all devices)
 * @param userId The user ID whose sessions should be revoked
 * @returns The number of sessions revoked
 */
export const revokeAllUserSessions = async (
  userId: number,
): Promise<number> => {
  const db: DrizzleType = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .update(sessionsTable)
      .set({
        status: "revoked",
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(sessionsTable.userId, userId),
          eq(sessionsTable.status, "active"),
        ),
      )
      .returning({ id: sessionsTable.id });

    return result.length;
  } catch (error) {
    dbLogger.error("Error revoking user sessions:" + error);
    throw error;
  }
};

/**
 * Bumps the last activity timestamp on a session
 * @param sessionId The public session identifier
 * @returns True if the session was updated, false otherwise
 */
export const touchSession = async (
  sessionId: string,
): Promise<boolean> => {
  const db: DrizzleType = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .update(sessionsTable)
      .set({ lastActivityAt: new Date().toISOString() })
      .where(eq(sessionsTable.sessionId, sessionId))
      .returning({ id: sessionsTable.id });

    return result.length > 0;
  } catch (error) {
    dbLogger.error("Error touching session:" + error);
    throw error;
  }
};

/**
 * Retrieves all sessions for a user
 * @param userId The user ID to fetch sessions for
 * @returns An array of Session objects
 */
export const listUserSessions = async (
  userId: number,
): Promise<Session[]> => {
  const db: DrizzleType = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    return await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.userId, userId));
  } catch (error) {
    dbLogger.error("Error listing user sessions:" + error);
    throw error;
  }
};

/**
 * Cleanup expired or revoked sessions from the database
 * @returns The number of sessions deleted
 */
export const cleanupExpiredSessions = async (): Promise<number> => {
  const db: DrizzleType = await getClient();
  const currentTime: string = new Date().toISOString();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .delete(sessionsTable)
      .where(lt(sessionsTable.expiresAt, currentTime))
      .returning({ id: sessionsTable.id });

    return result.length;
  } catch (error) {
    dbLogger.error("Error cleaning up expired sessions:" + error);
    throw error;
  }
};