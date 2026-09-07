import { NextRequest, NextResponse } from "next/server";
import type { SavedPlaceRecord } from "@rasa/shared";
import {
  anonymousSessionCookieName,
  getAnonymousSession,
  type AnonymousSession,
} from "@/lib/anonymous-session";
import { normalizeInstagramReelUrl } from "@/lib/instagram-url";

export const dynamic = "force-dynamic";

const maxSavesPerSession = 100;

type SaveRequest = {
  save?: SavedPlaceRecord;
};

type SavedPlaceRow = {
  id: string;
  place_id: string;
  place_name: string;
  area: string;
  source: SavedPlaceRecord["source"];
  source_url?: string | null;
  creator_handle?: string | null;
  raw_input: string;
  confidence: number;
  resolution_status?: SavedPlaceRecord["resolutionStatus"] | null;
  resolver_note?: string | null;
  resolved_at?: string | null;
  created_at: string;
};

function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return url && key ? { key, url } : null;
}

function supabaseFetch(
  config: NonNullable<ReturnType<typeof supabaseConfig>>,
  path: string,
  init: RequestInit = {},
) {
  const headers = new Headers(init.headers);
  headers.set("apikey", config.key);

  if (!config.key.startsWith("sb_")) {
    headers.set("Authorization", `Bearer ${config.key}`);
  }

  return fetch(`${config.url}/rest/v1/${path}`, { ...init, headers });
}

function saveFromRow(row: SavedPlaceRow): SavedPlaceRecord {
  return {
    id: row.id,
    placeId: row.place_id,
    placeName: row.place_name,
    area: row.area,
    source: row.source,
    sourceUrl: row.source_url ?? undefined,
    creatorHandle: row.creator_handle ?? undefined,
    rawInput: row.raw_input,
    confidence: Number(row.confidence),
    resolutionStatus: row.resolution_status ?? undefined,
    resolverNote: row.resolver_note ?? undefined,
    resolvedAt: row.resolved_at ?? undefined,
    createdAt: row.created_at,
  };
}

function responseWithSession(body: unknown, session: AnonymousSession | null, init?: ResponseInit) {
  const response = NextResponse.json(body, init);

  if (session?.shouldSetCookie) {
    response.cookies.set({
      name: anonymousSessionCookieName,
      value: session.cookieValue,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}

function getSession(request: NextRequest, config: NonNullable<ReturnType<typeof supabaseConfig>>) {
  return getAnonymousSession(
    request.cookies.get(anonymousSessionCookieName)?.value,
    process.env.RASA_SESSION_SECRET ?? config.key,
  );
}

function isClientSave(value: unknown): value is SavedPlaceRecord {
  if (!value || typeof value !== "object") return false;

  const save = value as Partial<SavedPlaceRecord>;
  return (
    typeof save.id === "string" &&
    /^save-[A-Za-z0-9_-]{8,128}$/.test(save.id) &&
    typeof save.sourceUrl === "string" &&
    save.sourceUrl.length <= 2048
  );
}

function rowFromSave(save: SavedPlaceRecord, userKey: string) {
  const sourceUrl = normalizeInstagramReelUrl(save.sourceUrl ?? "");

  if (!sourceUrl) return null;

  const createdAt = new Date().toISOString();

  return {
    id: save.id,
    user_key: userKey,
    place_id: `saved-reel-${save.id}`,
    place_name: "Instagram Reel",
    area: "Saved Reel",
    source: "instagram",
    source_url: sourceUrl,
    creator_handle: null,
    raw_input: sourceUrl,
    confidence: 0,
    resolution_status: "pending",
    resolver_note: "Saved to your Rasa Map.",
    resolved_at: null,
    created_at: createdAt,
    updated_at: createdAt,
  };
}

async function readSave(
  config: NonNullable<ReturnType<typeof supabaseConfig>>,
  userKey: string,
  id: string,
) {
  const response = await supabaseFetch(
    config,
    `saved_places?select=*&id=eq.${encodeURIComponent(id)}&user_key=eq.${encodeURIComponent(userKey)}`,
  );

  if (!response.ok) return null;
  const rows = (await response.json()) as SavedPlaceRow[];
  return rows[0] ? saveFromRow(rows[0]) : null;
}

export async function GET(request: NextRequest) {
  const config = supabaseConfig();

  if (!config) {
    return NextResponse.json({ mode: "local", saves: [] });
  }

  const session = getSession(request, config);
  const response = await supabaseFetch(
    config,
    `saved_places?select=*&user_key=eq.${encodeURIComponent(session.userKey)}&order=created_at.desc&limit=${maxSavesPerSession}`,
  );

  if (!response.ok) {
    return responseWithSession({ error: "Could not load saved Reels." }, session, { status: 503 });
  }

  const rows = (await response.json()) as SavedPlaceRow[];
  return responseWithSession({ mode: "supabase", saves: rows.map(saveFromRow) }, session);
}

export async function POST(request: NextRequest) {
  let body: SaveRequest;

  try {
    body = (await request.json()) as SaveRequest;
  } catch {
    return NextResponse.json({ error: "Invalid save payload." }, { status: 400 });
  }

  if (!isClientSave(body.save)) {
    return NextResponse.json({ error: "Paste a valid Instagram Reel link." }, { status: 400 });
  }

  const sourceUrl = body.save?.sourceUrl;

  if (!sourceUrl || !normalizeInstagramReelUrl(sourceUrl)) {
    return NextResponse.json({ error: "Paste a valid Instagram Reel link." }, { status: 400 });
  }

  const config = supabaseConfig();

  if (!config) {
    return NextResponse.json({ mode: "local" });
  }

  const session = getSession(request, config);
  const row = rowFromSave(body.save, session.userKey);

  if (!row) {
    return responseWithSession({ error: "Paste a valid Instagram Reel link." }, session, {
      status: 400,
    });
  }

  const existing = await readSave(config, session.userKey, row.id);

  if (existing) {
    return responseWithSession({ mode: "supabase", save: existing }, session);
  }

  const response = await supabaseFetch(config, "saved_places", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(row),
  });

  if (!response.ok) {
    return responseWithSession({ error: "Could not save this Reel." }, session, { status: 503 });
  }

  const rows = (await response.json()) as SavedPlaceRow[];
  return responseWithSession(
    { mode: "supabase", save: rows[0] ? saveFromRow(rows[0]) : body.save },
    session,
  );
}

export async function DELETE(request: NextRequest) {
  const config = supabaseConfig();

  if (!config) {
    return NextResponse.json({ mode: "local", cleared: true });
  }

  const session = getSession(request, config);
  const id = new URL(request.url).searchParams.get("id");
  const target = id
    ? `saved_places?id=eq.${encodeURIComponent(id)}&user_key=eq.${encodeURIComponent(session.userKey)}`
    : `saved_places?user_key=eq.${encodeURIComponent(session.userKey)}`;
  const response = await supabaseFetch(config, target, { method: "DELETE" });

  if (!response.ok) {
    return responseWithSession({ error: "Could not remove saved Reel." }, session, { status: 503 });
  }

  return responseWithSession({ mode: "supabase", cleared: true }, session);
}
