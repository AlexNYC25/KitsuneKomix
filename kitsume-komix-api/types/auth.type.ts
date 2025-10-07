import type { AccessClaims } from "../auth/auth.ts";
import type { JWTPayload } from "jose";

export type AppEnv = {
  Variables: {
    user?: AccessClaims & JWTPayload;
  };
};