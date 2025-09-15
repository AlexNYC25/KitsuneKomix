export const ISSUER = Deno.env.get("JWT_ISSUER") || "kitsunekomix";
export const AUDIENCE = Deno.env.get("JWT_AUDIENCE") || "kitsunekomix_users";
export const ACCESS_TTL = Deno.env.get("JWT_ACCESS_TTL") || "15m"; // 15 minutes
export const REFRESH_TTL = Deno.env.get("JWT_REFRESH_TTL") || "7d"; // 7 days

const secret = Deno.env.get("JWT_SECRET");
if (!secret) {
  throw new Error("JWT_SECRET environment variable is not set.");
}

const refreshSecret = Deno.env.get("JWT_REFRESH_SECRET") || secret + "_refresh";

export const JWT_SECRET = secret;
export const JWT_REFRESH_SECRET = refreshSecret;

export const ACCESS_KEY = new TextEncoder().encode(JWT_SECRET);
export const REFRESH_KEY = new TextEncoder().encode(JWT_REFRESH_SECRET);