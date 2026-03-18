import * as jose from "jose";
import {
  ACCESS_KEY,
  ACCESS_TTL,
  AUDIENCE,
  ISSUER,
  REFRESH_KEY,
  REFRESH_TTL,
} from "./jwtSetUp.ts";

export type AccessClaims = {
  sub: string;
  roles?: string[];
  scope?: string;
};

export type RefreshClaims = {
  sub: string;
  type: "refresh";
  jti: string; // JWT ID for refresh token tracking
};

/**
 * Signs an access token.
 * @param claims The claims to include in the token.
 * @returns The signed JWT.
 */
export async function signAccessToken(claims: AccessClaims): Promise<string> {
  return await new jose.SignJWT(claims)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(ACCESS_KEY);
}

/**
 * Verifies an access token.
 * @param token The JWT to verify.
 * @returns The decoded token payload.
 */
export async function verifyAccessToken(
  token: string,
): Promise<AccessClaims & jose.JWTPayload> {
  const { payload } = await jose.jwtVerify(token, ACCESS_KEY, {
    issuer: ISSUER,
    audience: AUDIENCE,
  });
  return payload as AccessClaims & jose.JWTPayload;
}

/**
 * Signs a refresh token.
 * @param claims The claims to include in the token.
 * @returns The signed JWT refresh token.
 */
export async function signRefreshToken(claims: RefreshClaims): Promise<string> {
  return await new jose.SignJWT(claims)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(REFRESH_TTL)
    .sign(REFRESH_KEY);
}

/**
 * Verifies a refresh token.
 * @param token The refresh JWT to verify.
 * @returns The decoded token payload.
 */
export async function verifyRefreshToken(
  token: string,
): Promise<RefreshClaims & jose.JWTPayload> {
  const { payload } = await jose.jwtVerify(token, REFRESH_KEY, {
    issuer: ISSUER,
    audience: AUDIENCE,
  });

  // Ensure this is actually a refresh token
  if (payload.type !== "refresh") {
    throw new Error("Invalid token type: expected refresh token");
  }

  return payload as RefreshClaims & jose.JWTPayload;
}

/**
 * Generates both access and refresh tokens for a user.
 * @param userId The user ID (sub claim).
 * @param roles Optional user roles.
 * @returns Object containing both tokens.
 */
export async function generateTokenPair(
  userId: string,
  roles?: string[],
): Promise<{
  accessToken: string;
  refreshToken: string;
  refreshTokenId: string;
}> {
  // Generate a unique ID for the refresh token
  const refreshTokenId = crypto.randomUUID();

  const accessToken = await signAccessToken({
    sub: userId,
    roles,
    scope: "access",
  });

  const refreshToken = await signRefreshToken({
    sub: userId,
    type: "refresh",
    jti: refreshTokenId,
  });

  return {
    accessToken,
    refreshToken,
    refreshTokenId,
  };
}
