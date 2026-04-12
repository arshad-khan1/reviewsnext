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

let refreshPromise: Promise<string | null> | null = null;

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
    const urlStr =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    // We want to attempt refresh if we HAD an access token (active session expired),
    // OR if we are explicitly fetching the initial session state since the refresh cookie might exist.
    const isAuthMe = urlStr.includes("/api/auth/me");
    const shouldAttemptRefresh = !!accessToken || isAuthMe;

    if (!shouldAttemptRefresh) {
      return response;
    }

    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const refreshRes = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "same-origin",
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            setAccessToken(data.accessToken);
            return data.accessToken;
          } else {
            setAccessToken(null);
            return null;
          }
        } catch (error) {
          console.error("Token refresh completely failed", error);
          setAccessToken(null);
          return null;
        } finally {
          refreshPromise = null;
        }
      })();
    }

    const newToken = await refreshPromise;

    if (newToken) {
      // Retry the original request with the newly issued token
      headers.set("Authorization", `Bearer ${newToken}`);
      return fetch(input, { ...init, headers });
    } else {
      // Return the original 401 response if refresh failed
      return response;
    }
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
    const isFormData = body instanceof FormData;
    if (!isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return apiFetch(url, {
      ...init,
      method: "POST",
      headers,
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    });
  },

  put: (url: string, body?: any, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    const isFormData = body instanceof FormData;
    if (!isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return apiFetch(url, {
      ...init,
      method: "PUT",
      headers,
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    });
  },

  patch: (url: string, body?: any, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    const isFormData = body instanceof FormData;
    if (!isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return apiFetch(url, {
      ...init,
      method: "PATCH",
      headers,
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    });
  },

  delete: (url: string, init?: RequestInit) =>
    apiFetch(url, { ...init, method: "DELETE" }),
};
