import { Context, Hono } from "hono";

import { authenticateUser } from "../services/auth.service.ts";
import { signAccessToken } from "../auth/auth.ts";
import type { AccessClaims } from "../auth/auth.ts";

const app = new Hono();

app.post("/login", async (c: Context) => {
  const { email, password } = await c.req.json();

  try {
    const user = await authenticateUser(email, password);

    //first format user data for token
    const userTokenData: AccessClaims = {
			sub: user.id.toString(),
			roles: user.admin ? ['admin'] : ['user'],
			scope: 'read:comics write:comics',
		}

    const token = await signAccessToken(userTokenData);
    return c.json({ message: "Login successful", user, token }, 200);
  } catch (error: Error | unknown) {
    return c.json({ message: (error as Error).message }, 401);
  }
});


export default app;