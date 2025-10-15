# JWT Refresh Token System

This document explains how to use the JWT refresh token system implemented in
KitsuneKomix API.

## Overview

The refresh token system provides secure, long-lived authentication with the
following benefits:

- **Short-lived access tokens** (15 minutes) for API requests
- **Long-lived refresh tokens** (7 days) for obtaining new access tokens
- **Token revocation** support for logout functionality
- **Database tracking** of refresh tokens for security

## Authentication Flow

### 1. Login

**Endpoint:** `POST /api/auth/login`

**Request:**

```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "admin": false
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Using Access Tokens

Include the access token in the Authorization header for protected routes:

```bash
curl -H "Authorization: Bearer <accessToken>" \
  http://localhost:3000/api/users/profile
```

### 3. Refreshing Tokens

When the access token expires (401 response), use the refresh token to get new
tokens:

**Endpoint:** `POST /api/auth/refresh-token`

**Request:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Logout

**Endpoint:** `POST /api/auth/logout`

**Request:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "message": "Logout successful"
}
```

### 5. Logout from All Devices

**Endpoint:** `POST /api/auth/logout-all` (requires active access token)

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Response:**

```json
{
  "message": "Logged out from all devices successfully",
  "revokedTokens": 3
}
```

## Client-Side Implementation

### JavaScript/TypeScript Example

```typescript
class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  async login(email: string, password: string) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;

      // Store in localStorage/sessionStorage if needed
      localStorage.setItem("refreshToken", this.refreshToken);
      return data;
    }
    throw new Error("Login failed");
  }

  async makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
    // Try with current access token
    let response = await this.fetchWithAuth(url, options);

    // If token expired, refresh and retry
    if (response.status === 401) {
      await this.refreshAccessToken();
      response = await this.fetchWithAuth(url, options);
    }

    return response;
  }

  private async fetchWithAuth(url: string, options: RequestInit) {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        "Authorization": `Bearer ${this.accessToken}`,
      },
    });
  }

  private async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch("/api/auth/refresh-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      localStorage.setItem("refreshToken", this.refreshToken);
    } else {
      // Refresh failed, redirect to login
      this.logout();
      window.location.href = "/login";
    }
  }

  async logout() {
    if (this.refreshToken) {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
    }

    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem("refreshToken");
  }
}
```

## Security Features

### Database Tracking

- All refresh tokens are stored in the `refresh_tokens` table
- Tokens can be revoked individually or in bulk
- Expired tokens are automatically rejected

### Token Rotation

- Each refresh operation provides a new refresh token
- Old refresh tokens are immediately revoked
- Prevents token replay attacks

### Automatic Cleanup

- The system includes a `cleanupExpiredTokens()` function
- Can be run as a scheduled job to remove expired tokens

## Environment Variables

Set these environment variables for security:

```bash
# Required - Secret for signing access tokens
JWT_SECRET=your-super-secure-secret-key

# Optional - Separate secret for refresh tokens (recommended)
JWT_REFRESH_SECRET=your-refresh-token-secret

# Optional - Token lifetimes
JWT_ACCESS_TTL=15m   # 15 minutes
JWT_REFRESH_TTL=7d   # 7 days

# Optional - JWT issuer and audience
JWT_ISSUER=kitsunekomix
JWT_AUDIENCE=kitsunekomix_users
```

## Database Schema

The refresh token system requires this table:

```sql
CREATE TABLE refresh_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_id TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  revoked INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Error Handling

Common error responses:

- **400 Bad Request**: Missing refresh token in request
- **401 Unauthorized**: Invalid, expired, or revoked refresh token
- **403 Forbidden**: User lacks required permissions
- **500 Internal Server Error**: Database or server errors

## Best Practices

1. **Store refresh tokens securely** (httpOnly cookies or secure storage)
2. **Implement automatic token refresh** in your API client
3. **Handle token expiration gracefully** with fallback to login
4. **Use HTTPS in production** to protect tokens in transit
5. **Run periodic cleanup** of expired tokens
6. **Log authentication events** for security monitoring

## Testing

Test the refresh token system with these curl commands:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Use access token
curl -H "Authorization: Bearer <access-token>" \
  http://localhost:3000/api/users/profile

# Refresh token
curl -X POST http://localhost:3000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refresh-token>"}'

# Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refresh-token>"}'
```
