
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