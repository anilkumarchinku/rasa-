import { NextResponse } from "next/server";
import type { SavedPlaceRecord } from "@rasa/shared";

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

  if (!url || !key) {
    return null;
  }

  return { key, url };
}

function userKeyFromRequest(request: Request) {
  return request.headers.get("x-rasa-device-id")?.trim() || "demo-browser";
}

function rowFromSave(save: SavedPlaceRecord, userKey: string) {
  return {
    id: save.id,
    user_key: userKey,
    place_id: save.placeId,
    place_name: save.placeName,
    area: save.area,
    source: save.source,
    source_url: save.sourceUrl ?? null,
    creator_handle: save.creatorHandle ?? null,
    raw_input: save.rawInput,
    confidence: save.confidence,
    resolution_status: save.resolutionStatus ?? null,
    resolver_note: save.resolverNote ?? null,
    resolved_at: save.resolvedAt ?? null,
    created_at: save.createdAt,
    updated_at: new Date().toISOString(),
  };
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

async function supabaseFetch(path: string, init: RequestInit = {}) {
  const config = supabaseConfig();

  if (!config) {
    return null;
  }

  const isOpaqueApiKey = config.key.startsWith("sb_");
  const headers = new Headers(init.headers);
  headers.set("apikey", config.key);

  if (!isOpaqueApiKey) {
    headers.set("Authorization", `Bearer ${config.key}`);
  }

  return fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers,
  });
}

async function supabaseError(response: Response) {
  const text = await response.text();

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text || response.statusText;
  }
}

export async function GET(request: Request) {
  const userKey = userKeyFromRequest(request);
  const response = await supabaseFetch(
    `saved_places?select=*&user_key=eq.${encodeURIComponent(userKey)}&order=created_at.desc`,
  );

  if (!response) {
    return NextResponse.json({ mode: "local", saves: [] });
  }

  if (!response.ok) {
    return NextResponse.json(
      {
        mode: "local",
        error: "Supabase read failed.",
        detail: await supabaseError(response),
        saves: [],
      },
      { status: 200 },
    );
  }

  const rows = (await response.json()) as SavedPlaceRow[];

  return NextResponse.json({
    mode: "supabase",
    saves: rows.map(saveFromRow),
  });
}

export async function POST(request: Request) {
  const userKey = userKeyFromRequest(request);
  const body = (await request.json()) as SaveRequest;

  if (!body.save) {
    return NextResponse.json({ error: "Missing save payload." }, { status: 400 });
  }

  const response = await supabaseFetch("saved_places?on_conflict=id", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(rowFromSave(body.save, userKey)),
  });

  if (!response) {
    return NextResponse.json({ mode: "local", save: body.save });
  }

  if (!response.ok) {
    return NextResponse.json(
      {
        mode: "local",
        error: "Supabase save failed.",
        detail: await supabaseError(response),
        save: body.save,
      },
      { status: 200 },
    );
  }

  const rows = (await response.json()) as SavedPlaceRow[];

  return NextResponse.json({
    mode: "supabase",
    save: rows[0] ? saveFromRow(rows[0]) : body.save,
  });
}

export async function DELETE(request: Request) {
  const userKey = userKeyFromRequest(request);
  const response = await supabaseFetch(`saved_places?user_key=eq.${encodeURIComponent(userKey)}`, {
    method: "DELETE",
  });

  if (!response) {
    return NextResponse.json({ mode: "local", cleared: true });
  }

  if (!response.ok) {
    return NextResponse.json({
      mode: "local",
      cleared: true,
      error: "Supabase clear failed.",
      detail: await supabaseError(response),
    });
  }

  return NextResponse.json({ mode: "supabase", cleared: true });
}
