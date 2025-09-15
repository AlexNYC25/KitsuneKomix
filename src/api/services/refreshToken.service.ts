import { generateTokenPair, verifyRefreshToken } from "../auth/auth.ts";
import { 
  storeRefreshToken, 
  getValidRefreshToken, 
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
  cleanupExpiredTokens
} from "../db/sqlite/models/refreshTokens.model.ts";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Creates and stores a new refresh token pair for a user
 */
export async function createRefreshTokenPair(
  userId: number, 
  roles?: string[]
): Promise<TokenPair> {
  // Generate the token pair
  const { accessToken, refreshToken, refreshTokenId } = await generateTokenPair(
    userId.toString(), 
    roles
  );
  
  // Calculate expiration time (7 days from now by default)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  // Store the refresh token in the database
  await storeRefreshToken({
    user_id: userId,
    token_id: refreshTokenId,
    expires_at: expiresAt.toISOString()
  });
  
  return {
    accessToken,
    refreshToken
  };
}

/**
 * Refreshes an access token using a valid refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<RefreshTokenResponse> {
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
      refreshToken: newTokenPair.refreshToken
    };
    
  } catch (error) {
    throw new Error(`Invalid refresh token: ${error instanceof Error ? error.message : String(error)}`);
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

/**
 * Enhanced refresh with user roles from database
 * This is a more complete version that fetches user data
 */
export async function refreshAccessTokenWithUserData(
  refreshToken: string,
  getUserRoles: (userId: number) => Promise<string[]>
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
      refreshToken: newTokenPair.refreshToken
    };
    
  } catch (error) {
    throw new Error(`Invalid refresh token: ${error instanceof Error ? error.message : String(error)}`);
  }
}