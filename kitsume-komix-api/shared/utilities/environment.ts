export const CLIENT_URL = Deno.env.get("CLIENT_URL") || "http://localhost:5173";
export const API_PORT = Deno.env.get("API_PORT") || "8000";

const parseBooleanEnv = (value: string | undefined, fallback: boolean): boolean => {
	if (!value) {
		return fallback;
	}

	const normalized = value.trim().toLowerCase();
	if (["true", "1", "yes", "on"].includes(normalized)) {
		return true;
	}

	if (["false", "0", "no", "off"].includes(normalized)) {
		return false;
	}

	return fallback;
};

const parseNumberEnv = (value: string | undefined, fallback: number): number => {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseSameSiteEnv = (value: string | undefined): "Lax" | "Strict" | "None" => {
	const normalized = value?.trim().toLowerCase();
	if (normalized === "strict") {
		return "Strict";
	}

	if (normalized === "none") {
		return "None";
	}

	return "Lax";
};

// Cookie name used to store the short-lived access token in browser sessions.
export const ACCESS_COOKIE_NAME = Deno.env.get("ACCESS_COOKIE_NAME") || "kk_access_token";
// Cookie name used to store the long-lived refresh token for token rotation.
export const REFRESH_COOKIE_NAME = Deno.env.get("REFRESH_COOKIE_NAME") || "kk_refresh_token";

// Access-token cookie lifetime in seconds (default 5 hours).
export const ACCESS_COOKIE_MAX_AGE_SECONDS = parseNumberEnv(
	Deno.env.get("ACCESS_COOKIE_MAX_AGE_SECONDS"),
	18000,
);
// Refresh-token cookie lifetime in seconds (default 7 days).
export const REFRESH_COOKIE_MAX_AGE_SECONDS = parseNumberEnv(
	Deno.env.get("REFRESH_COOKIE_MAX_AGE_SECONDS"),
	604800,
);

// Optional cookie domain scope; unset keeps cookies host-only for safer defaults.
export const COOKIE_DOMAIN = Deno.env.get("COOKIE_DOMAIN");
// Path scope for access-token cookie.
export const COOKIE_PATH = Deno.env.get("COOKIE_PATH") || "/";
// Path scope for refresh-token cookie, limited to auth endpoints by default.
export const REFRESH_COOKIE_PATH = Deno.env.get("REFRESH_COOKIE_PATH") || "/api/auth";

// Prevent client-side JavaScript from reading auth cookies when true.
export const COOKIE_HTTP_ONLY = parseBooleanEnv(
	Deno.env.get("COOKIE_HTTP_ONLY"),
	true,
);
// Require HTTPS transport for cookies when true.
// Default auto-detects from CLIENT_URL protocol and can be overridden via env.
export const COOKIE_SECURE = parseBooleanEnv(
	Deno.env.get("COOKIE_SECURE"),
	CLIENT_URL.startsWith("https://"),
);
// Cross-site cookie policy: Lax, Strict, or None (falls back to Lax).
export const COOKIE_SAME_SITE = parseSameSiteEnv(
	Deno.env.get("COOKIE_SAME_SITE"),
);
