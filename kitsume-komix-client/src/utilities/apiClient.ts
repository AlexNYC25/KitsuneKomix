import createClient, { type Middleware } from "openapi-fetch";

import { env } from "@/config/env";
import type { AuthRelaxedPaths } from "@/types/api.types";

const apiClientBaseURL = env.API_URL + "/api";
const apiRootBaseURL = env.API_URL;

let authToken: string | null = null;
let refreshToken: string | null = null;
let onTokenRefresh: (() => Promise<boolean>) | null = null;
const retryableRequests = new WeakMap<Request, Request>();

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

const getAuthorizationHeader = (): string | null => {
	return authToken ? `Bearer ${authToken}` : null;
};

const withAuthHeader = (request: Request): Request => {
  const headers = new Headers(request.headers);

  const authorizationHeader = getAuthorizationHeader();

  if (authorizationHeader) {
    headers.set("Authorization", authorizationHeader);
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
  const baseRequest = new Request(input, { ...init, credentials: 'include' });
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
    // Keep a cloned copy so retry logic can resend requests with bodies.
    retryableRequests.set(request, request.clone());

    const authorizationHeader = getAuthorizationHeader();

    if (authorizationHeader) {
      request.headers.set("Authorization", authorizationHeader);
    }
    return request;
  },
  async onResponse({ response, request }) {
    // Handle 401 responses by attempting to refresh the token
    if (response.status === 401 && refreshToken && onTokenRefresh) {
      const refreshed = await onTokenRefresh();
      
      if (refreshed && authToken) {
        // Retry the request with the new token and original request body.
        const retrySource = retryableRequests.get(request) ?? request;
        const newRequest = new Request(retrySource, {
          headers: new Headers(retrySource.headers),
        });
        newRequest.headers.set("Authorization", `Bearer ${authToken}`);

        retryableRequests.delete(request);
        
        return fetch(newRequest);
      }
    }

    retryableRequests.delete(request);
    
    return response;
  },
};

export const apiClient = createClient<AuthRelaxedPaths>({
  baseUrl: apiClientBaseURL,
  credentials: 'include',
});

// Apply the auth middleware
apiClient.use(authMiddleware);
