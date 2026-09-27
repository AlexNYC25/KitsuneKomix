import { cleanupExpiredTokens } from "./refreshTokens.model.ts";
import { cleanupExpiredSessions } from "./sessions.model.ts";
import { cleanupExpiredApiKeys } from "./apiKeys.model.ts";
import { dbLogger } from "../loggers/index.ts";

/**
 * Prunes expired/revoked auth records across all auth tables.
 * Intended to run on a schedule from the API process.
 * @returns A summary of how many records were deleted per table
 */
export const pruneExpiredAuthData = async (): Promise<{
  refreshTokens: number;
  sessions: number;
  apiKeys: number;
}> => {
  const [refreshTokens, sessions, apiKeys] = await Promise.all([
    cleanupExpiredTokens(),
    cleanupExpiredSessions(),
    cleanupExpiredApiKeys(),
  ]);

  dbLogger.info(
    `Auth data pruned: ${refreshTokens} refresh tokens, ${sessions} sessions, ${apiKeys} api keys`,
  );

  return { refreshTokens, sessions, apiKeys };
};