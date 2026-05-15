import { NextResponse } from "next/server";
import type { InstagramResolverResult, SavedPlaceRecord } from "@rasa/shared";

export const dynamic = "force-dynamic";

type SavedPlaceRow = {
  id: string;
  user_key: string;
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

  if (!url || !key) {
    return null;
  }

  return { key, url };
}

function isAuthorized(request: Request) {
  const secret = process.env.RASA_RESOLVER_CRON_SECRET;

  if (!secret) {
    return true;
  }

  const authHeader = request.headers.get("authorization");
  const directHeader = request.headers.get("x-rasa-cron-secret");

  return authHeader === `Bearer ${secret}` || directHeader === secret;
}

async function supabaseFetch(path: string, init: RequestInit = {}) {
  const config = supabaseConfig();

  if (!config) {
    return null;
  }

  return fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      ...init.headers,
    },
  });
}

function rowToSave(row: SavedPlaceRow): SavedPlaceRecord {
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

function patchFromResolver(save: SavedPlaceRecord, result: InstagramResolverResult) {
  if (result.status === "resolved" && result.place) {
    return {
      area: result.place.area,
      confidence: result.confidence,
      creator_handle: result.creatorHandle ?? save.creatorHandle ?? null,
      place_id: result.place.id,
      place_name: result.place.name,
      resolution_status: "matched",
      resolved_at: new Date().toISOString(),
      resolver_note: result.note,
      updated_at: new Date().toISOString(),
    };
  }

  return {
    area: result.extractedArea ?? save.area,
    confidence: result.confidence,
    creator_handle: result.creatorHandle ?? save.creatorHandle ?? null,
    place_name: result.extractedPlaceName ?? save.placeName,
    resolution_status: result.status === "review" ? "review" : "pending",
    resolver_note: result.note,
    updated_at: new Date().toISOString(),
  };
}

async function resolveSave(request: Request, save: SavedPlaceRecord) {
  const origin = new URL(request.url).origin;
  const response = await fetch(`${origin}/api/instagram/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: save.sourceUrl ?? save.rawInput }),
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as InstagramResolverResult;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized resolver run." }, { status: 401 });
  }

  const config = supabaseConfig();

  if (!config) {
    return NextResponse.json({
      mode: "local",
      note: "Supabase env vars are not configured, so pending local saves retry in the browser.",
      processed: 0,
      updated: 0,
    });
  }

  const limit = Number(new URL(request.url).searchParams.get("limit") ?? 10);
  const pendingResponse = await supabaseFetch(
    `saved_places?select=*&source=eq.instagram&resolution_status=in.(pending,review)&order=created_at.asc&limit=${Math.min(
      25,
      Math.max(1, limit),
    )}`,
  );

  if (!pendingResponse?.ok) {
    return NextResponse.json({
      mode: "supabase",
      error: "Could not load pending saved places.",
      processed: 0,
      updated: 0,
    });
  }

  const rows = (await pendingResponse.json()) as SavedPlaceRow[];
  let updated = 0;
  const results = [];

  for (const row of rows) {
    const save = rowToSave(row);
    const result = await resolveSave(request, save);

    if (!result) {
      results.push({ id: save.id, status: "failed" });
      continue;
    }

    const patchResponse = await supabaseFetch(`saved_places?id=eq.${encodeURIComponent(save.id)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(patchFromResolver(save, result)),
    });

    if (patchResponse?.ok) {
      updated += 1;
    }

    results.push({
      id: save.id,
      placeName: result.place?.name ?? result.extractedPlaceName ?? save.placeName,
      status: result.status,
    });
  }

  return NextResponse.json({
    mode: "supabase",
    processed: rows.length,
    results,
    updated,
  });
}
