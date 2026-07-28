/**
 * Transport layer.
 *
 * The whole application talks to the backend exclusively through this client.
 * Swapping it (Express, GraphQL, tRPC, gRPC-web) only requires changing this file.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = `${BASE_URL.replace(/\/$/, "")}${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

export const httpClient = {
  isConfigured: () => Boolean(BASE_URL),

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const response = await fetch(buildUrl(path, options.query), {
      method: options.method ?? "GET",
      headers: { "Content-Type": "application/json" },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });

    if (!response.ok) {
      throw new HttpError(response.status, `Request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  },
};
