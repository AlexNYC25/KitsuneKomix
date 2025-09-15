import * as jose from 'jose';
import { ISSUER, AUDIENCE, ACCESS_TTL, ACCESS_KEY } from '../config/auth/jwtSetUp.ts';

export type AccessClaims = {
  sub: string
  roles?: string[]
  scope?: string
}

/**
 * Signs an access token.
 * @param claims The claims to include in the token.
 * @returns The signed JWT.
 */
export async function signAccessToken(claims: AccessClaims): Promise<string> {
  return await new jose.SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(ACCESS_KEY)
}

/**
 * Verifies an access token.
 * @param token The JWT to verify.
 * @returns The decoded token payload.
 */
export async function verifyAccessToken(token: string): Promise<AccessClaims & jose.JWTPayload> {
  const { payload } = await jose.jwtVerify(token, ACCESS_KEY, {
    issuer: ISSUER,
    audience: AUDIENCE,
  })
  return payload as AccessClaims & jose.JWTPayload
}
