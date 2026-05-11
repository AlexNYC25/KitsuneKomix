
/**
 * Interface representing persisted authentication data.
 */
export interface PersistedAuth {
  token: string | null;
  refreshToken: string | null;
  user: { id: number; email: string; admin: boolean } | null;
}