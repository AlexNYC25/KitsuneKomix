import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "@/openapi/openapi-schema";

const apiClientBaseURL = "http://localhost:8000/api";
const apiRootBaseURL = "http://localhost:8000";

let authToken: string | null = null;
let refreshToken: string | null = null;
let onTokenRefresh: (() => Promise<boolean>) | null = null;

export function composeStaticUrl(path: string): string {
  return `${apiRootBaseURL}${path}`;
}

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function setRefreshToken(token: string | null) {
  refreshToken = token;
}

export function setTokenRefreshCallback(callback: (() => Promise<boolean>) | null) {
  onTokenRefresh = callback;
}

const withAuthHeader = (request: Request): Request => {
  const headers = new Headers(request.headers);

  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  return new Request(request, { headers });
};

/**
 * Specialized fetch function for authenticated image requests, which may not be handled by the openapi-fetch client. 
 * It includes logic to refresh tokens if a 401 response is received.
 * @param input - The input to the fetch function, either a URL or a Request object.
 * @param init - Optional fetch initialization parameters.
 * @returns A promise that resolves to the fetch Response object.
 */
export async function authenticatedImageFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const baseRequest = new Request(input, init);
  let response = await fetch(withAuthHeader(baseRequest.clone()));

  if (response.status === 401 && refreshToken && onTokenRefresh) {
    const refreshed = await onTokenRefresh();

    if (refreshed) {
      response = await fetch(withAuthHeader(baseRequest.clone()));
    }
  }

  return response;
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
