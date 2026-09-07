export type SupabaseAdminConfig = {
  key: string;
  url: string;
};

export function getSupabaseAdminConfig(): SupabaseAdminConfig | null {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!rawUrl || !key) return null;

  try {
    const url = new URL(rawUrl);
    const localDevelopmentUrl =
      process.env.NODE_ENV !== "production" &&
      url.protocol === "http:" &&
      ["127.0.0.1", "localhost"].includes(url.hostname);

    if (url.protocol !== "https:" && !localDevelopmentUrl) return null;

    return { key, url: url.toString().replace(/\/$/, "") };
  } catch {
    return null;
  }
}

export function getSessionSigningSecret(config: SupabaseAdminConfig) {
  return process.env.RASA_SESSION_SECRET ?? config.key;
}
