import type { auth } from "../utils/auth";

export type AuthUser = (typeof auth.$Infer.Session)["user"];
export type AuthSession = (typeof auth.$Infer.Session)["session"];

export type ApiEnv = {
	Variables: {
		requestId: string;
		user: AuthUser | null;
		session: AuthSession | null;
	};
};
