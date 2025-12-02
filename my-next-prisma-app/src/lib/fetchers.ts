/**
 * Centralized fetcher functions for SWR and data fetching
 * Eliminates repeated fetcher definitions across the codebase
 */

/**
 * Basic JSON fetcher for GET requests
 * @param url - API endpoint URL
 * @returns Parsed JSON response
 * @throws Error if response is not ok
 */
export const jsonFetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("API request failed");
    // Attach extra info to the error object
    (error as Error & { info?: unknown; status?: number }).info =
      await res.json();
    (error as Error & { info?: unknown; status?: number }).status = res.status;
    throw error;
  }
  return res.json();
};

/**
 * Authenticated fetcher with Bearer token
 * @param url - API endpoint URL
 * @param token - Authentication token
 * @returns Parsed JSON response
 */
export const authFetcher = async (url: string, token: string) => {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Authentication failed");
  }
  return res.json();
};

/**
 * POST request fetcher
 * @param url - API endpoint URL
 * @param data - Request body data
 * @returns Parsed JSON response
 */
export const postFetcher = async (url: string, data: unknown) => {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("POST request failed");
  }
  return res.json();
};

/**
 * PUT request fetcher
 * @param url - API endpoint URL
 * @param data - Request body data
 * @returns Parsed JSON response
 */
export const putFetcher = async (url: string, data: unknown) => {
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("PUT request failed");
  }
  return res.json();
};

/**
 * DELETE request fetcher
 * @param url - API endpoint URL
 * @returns Parsed JSON response
 */
export const deleteFetcher = async (url: string) => {
  const res = await fetch(url, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("DELETE request failed");
  }
  return res.json();
};

/**
 * Fetcher with custom headers
 * @param url - API endpoint URL
 * @param headers - Custom headers object
 * @returns Parsed JSON response
 */
export const customHeaderFetcher = async (
  url: string,
  headers: Record<string, string>
) => {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error("Request failed");
  }
  return res.json();
};

/**
 * Paginated fetcher - automatically handles page/limit params
 * @param baseUrl - Base API endpoint URL
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 20)
 * @returns Parsed JSON response with pagination metadata
 */
export const paginatedFetcher = async (
  baseUrl: string,
  page = 1,
  limit = 20
) => {
  const url = new URL(baseUrl, window.location.origin);
  url.searchParams.set("page", page.toString());
  url.searchParams.set("limit", limit.toString());

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error("Paginated request failed");
  }
  return res.json();
};

/**
 * SWR configuration presets
 */
export const swrConfig = {
  // Fast refresh for real-time data
  realtime: {
    refreshInterval: 3000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  },
  // Standard refresh for normal data
  standard: {
    refreshInterval: 10000,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  },
  // Slow refresh for static data
  static: {
    refreshInterval: 60000,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  },
  // No refresh for truly static data
  immutable: {
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
  },
};

/**
 * Helper to build query string from params object
 * @param params - Key-value pairs for query parameters
 * @returns Query string (e.g., "?key1=value1&key2=value2")
 */
export const buildQueryString = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
};
