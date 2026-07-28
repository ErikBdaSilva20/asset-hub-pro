import { httpClient } from "./http-client";
import type { ListParams, Paginated } from "@/shared/types";

/**
 * Repository layer.
 *
 * While no backend is connected (VITE_API_URL empty) the repository resolves
 * against the mock dataset. Delete `src/mock` and the fallback below to go live.
 */

const NETWORK_LATENCY_MS = 220;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), NETWORK_LATENCY_MS));
}

function matches(record: unknown, search: string) {
  return JSON.stringify(record).toLowerCase().includes(search.toLowerCase());
}

export interface Repository<T> {
  list(params?: ListParams): Promise<Paginated<T>>;
  byId(id: string): Promise<T | null>;
}

export function createRepository<T extends { id: string }>(
  resource: string,
  fallback: () => T[],
  statusOf?: (item: T) => string,
): Repository<T> {
  return {
    async list(params: ListParams = {}) {
      const { page = 1, pageSize = 10, search = "", status } = params;

      if (httpClient.isConfigured()) {
        return httpClient.request<Paginated<T>>(`/${resource}`, {
          query: { page, pageSize, search, status },
        });
      }

      let items = fallback();
      if (search) items = items.filter((item) => matches(item, search));
      if (status && status !== "all" && statusOf) {
        items = items.filter((item) => statusOf(item) === status);
      }

      const start = (page - 1) * pageSize;
      return delay({
        items: items.slice(start, start + pageSize),
        total: items.length,
        page,
        pageSize,
      });
    },

    async byId(id: string) {
      if (httpClient.isConfigured()) {
        return httpClient.request<T>(`/${resource}/${id}`);
      }
      return delay(fallback().find((item) => item.id === id) ?? null);
    },
  };
}
