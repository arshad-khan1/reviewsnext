/**
 * High-level API Client logic to act as a request interceptor.
 * Automatically attaches in-memory accessToken to requests.
 * Automatically queues and refreshes accessToken when a 401 response is encountered.
 */

/**
 * Get initial token from localStorage if available (client-side only)
 */
const STORAGE_KEY = "access_token";
let accessToken: string | null = null;

if (typeof window !== "undefined") {
  accessToken = localStorage.getItem(STORAGE_KEY);
}

let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

/**
 * Set the access token in memory and localStorage.
 */
export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

/**
 * Get the current access token.
 */
export function getAccessToken() {
  return accessToken;
}

/**
 * Add a callback to the queue to be executed after token refresh.
 */
function subscribeTokenRefresh(cb: (token: string | null) => void) {
  refreshSubscribers.push(cb);
}

/**
 * Execute all callbacks in the queue with the new token (or null if failed).
 */
function onRefreshed(token: string | null) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

/**
 * Custom fetch wrapper that handles:
 * 1. Attaching Authorization header automatically.
 * 2. Pausing parallel requests and automatic token rotation on 401 status.
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const headers = new Headers(init?.headers);

  // 1. Attach the token if we have it
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const modifiedInit = { ...init, headers };

  // 2. Perform original request
  const response = await fetch(input, modifiedInit);

  // 3. Intercept 401 logic
  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        // Attempt to refresh the session
        const refreshRes = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setAccessToken(data.accessToken);
          onRefreshed(data.accessToken);
        } else {
          // Token refresh failed, meaning user session is fully expired.
          setAccessToken(null);
          onRefreshed(null);
        }
      } catch (error) {
        console.error("Token refresh completely failed", error);
        setAccessToken(null);
        onRefreshed(null);
      } finally {
        isRefreshing = false;
      }
    }

    // Wait until the refresh succeeds (or fails)
    return new Promise((resolve) => {
      subscribeTokenRefresh((newToken: string | null) => {
        if (newToken) {
          // Retry the original request with the newly issued token
          headers.set("Authorization", `Bearer ${newToken}`);
          resolve(fetch(input, { ...init, headers }));
        } else {
          // Provide the original 401 error back to the caller so they can handle unauthenticated state
          resolve(response);
          // Optional: You could redirect the user here using window.location.href = '/login'
        }
      });
    });
  }

  // 4. Return the (successful) response directly
  return response;
}

/**
 * Convenience methods for structured API calls
 */
export const apiClient = {
  get: (url: string, init?: RequestInit) =>
    apiFetch(url, { ...init, method: "GET" }),

  post: (url: string, body?: any, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return apiFetch(url, {
      ...init,
      method: "POST",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put: (url: string, body?: any, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return apiFetch(url, {
      ...init,
      method: "PUT",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete: (url: string, init?: RequestInit) =>
    apiFetch(url, { ...init, method: "DELETE" }),
};
