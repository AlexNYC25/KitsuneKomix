import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "@/openapi/openapi-schema";

const apiClientBaseURL = "http://localhost:8000";

let authToken: string | null = null;
let refreshToken: string | null = null;
let onTokenRefresh: (() => Promise<boolean>) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function setRefreshToken(token: string | null) {
  refreshToken = token;
}

export function setTokenRefreshCallback(callback: (() => Promise<boolean>) | null) {
  onTokenRefresh = callback;
}

// Client middleware to handle authentication
const authMiddleware: Middleware = {
  async onRequest({ request }) {
    if (authToken) {
      request.headers.set("Authorization", `Bearer ${authToken}`);
    }
    return request;
  },
  async onResponse({ response, request }) {
    // Handle 401 responses by attempting to refresh the token
    if (response.status === 401 && refreshToken && onTokenRefresh) {
      const refreshed = await onTokenRefresh();
      
      if (refreshed && authToken) {
        // Retry the request with the new token
        const newRequest = new Request(request, {
          headers: new Headers(request.headers),
        });
        newRequest.headers.set("Authorization", `Bearer ${authToken}`);
        
        return fetch(newRequest);
      }
    }
    
    return response;
  },
};

export const apiClient = createClient<paths>({
  baseUrl: apiClientBaseURL,
});

// Apply the auth middleware
apiClient.use(authMiddleware);
