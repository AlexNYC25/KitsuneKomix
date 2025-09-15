import { Context, Hono } from "hono";

import { authenticateUser } from "../services/auth.service.ts";
import { 
  createRefreshTokenPair, 
  refreshAccessToken, 
  revokeToken,
  revokeAllUserTokens 
} from "../services/refreshToken.service.ts";
import { requireAuth } from "../middleware/authChecks.ts";

const app = new Hono();

app.post("/login", async (c: Context) => {
  const { email, password } = await c.req.json();

  try {
    const user = await authenticateUser(email, password);

    // Create refresh token pair instead of just access token
    const roles = user.admin ? ['admin'] : ['user'];
    const tokenPair = await createRefreshTokenPair(user.id, roles);

    return c.json({ 
      message: "Login successful", 
      user: {
        id: user.id,
        email: user.email,
        admin: user.admin
      },
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken
    }, 200);
  } catch (error: Error | unknown) {
    return c.json({ message: (error as Error).message }, 401);
  }
});

// New endpoint: Refresh access token
app.post("/refresh-token", async (c: Context) => {
  try {
    const { refreshToken } = await c.req.json();
    
    if (!refreshToken) {
      return c.json({ message: "Refresh token is required" }, 400);
    }

    const newTokens = await refreshAccessToken(refreshToken);
    
    return c.json({
      message: "Token refreshed successfully",
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken
    }, 200);
  } catch (error) {
    return c.json({ 
      message: `Token refresh failed: ${error instanceof Error ? error.message : String(error)}` 
    }, 401);
  }
});

// New endpoint: Logout (revoke refresh token)
app.post("/logout", async (c: Context) => {
  try {
    const { refreshToken } = await c.req.json();
    
    if (!refreshToken) {
      return c.json({ message: "Refresh token is required" }, 400);
    }

    await revokeToken(refreshToken);
    
    return c.json({ message: "Logout successful" }, 200);
  } catch (error) {
    return c.json({ 
      message: `Logout failed: ${error instanceof Error ? error.message : String(error)}` 
    }, 401);
  }
});

// New endpoint: Logout from all devices (requires authentication)
app.post("/logout-all", requireAuth, async (c: Context) => {
  try {
    const user = c.get("user");
    const userId = parseInt(user.sub);
    
    const revokedCount = await revokeAllUserTokens(userId);
    
    return c.json({ 
      message: `Logged out from all devices successfully`,
      revokedTokens: revokedCount
    }, 200);
  } catch (error) {
    return c.json({ 
      message: `Logout from all devices failed: ${error instanceof Error ? error.message : String(error)}` 
    }, 500);
  }
});


export default app;