import { getApiBaseUrl } from "@/constants/oauth";

type SellerSyncOptions = { method?: string; body?: string };

export async function sellerSyncCall<T>(endpoint: string, options: SellerSyncOptions = {}) {
  const base = getApiBaseUrl();
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = base ? `${cleanBase}${cleanEndpoint}` : cleanEndpoint;
  const response = await fetch(url, {
    method: options.method ?? "GET",
    body: options.body,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!response.ok) throw new Error(`Seller sync failed: ${response.status}`);
  return (await response.json()) as T;
}
