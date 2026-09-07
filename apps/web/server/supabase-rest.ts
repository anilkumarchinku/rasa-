import type { SupabaseAdminConfig } from "./config";

export class SupabaseRestError extends Error {
  constructor(public readonly status: number) {
    super(`Supabase REST request failed with status ${status}.`);
    this.name = "SupabaseRestError";
  }
}

export async function supabaseRest(
  config: SupabaseAdminConfig,
  path: string,
  init: RequestInit = {},
) {
  const headers = new Headers(init.headers);
  headers.set("apikey", config.key);
  headers.set("Accept", "application/json");

  if (!config.key.startsWith("sb_")) {
    headers.set("Authorization", `Bearer ${config.key}`);
  }

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers,
  });

  if (!response.ok) {
    throw new SupabaseRestError(response.status);
  }

  return response;
}

export async function supabaseRestJson<T>(
  config: SupabaseAdminConfig,
  path: string,
  init: RequestInit = {},
) {
  const response = await supabaseRest(config, path, init);
  return (await response.json()) as T;
}
