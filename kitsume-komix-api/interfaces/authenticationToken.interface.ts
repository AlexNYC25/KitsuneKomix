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

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
