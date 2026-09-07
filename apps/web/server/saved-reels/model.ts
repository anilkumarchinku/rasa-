import type { SavedPlaceRecord } from "@rasa/shared";
import { normalizeInstagramReelUrl } from "@/lib/instagram-url";

const saveIdPattern = /^save-[A-Za-z0-9_-]{8,128}$/;

export type ParsedSavedReel = {
  id: string;
  sourceUrl: string;
};

export type SavedReelRow = {
  id: string;
  place_id: string;
  place_name: string;
  area: string;
  source: SavedPlaceRecord["source"];
  source_url: string | null;
  creator_handle: string | null;
  raw_input: string;
  confidence: number;
  resolution_status: SavedPlaceRecord["resolutionStatus"] | null;
  resolver_note: string | null;
  resolved_at: string | null;
  created_at: string;
};

export type NewSavedReelRow = SavedReelRow & {
  user_key: string;
  updated_at: string;
};

export function isSaveId(value: string) {
  return saveIdPattern.test(value);
}

export function parseSavedReel(value: unknown): ParsedSavedReel | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as { id?: unknown; sourceUrl?: unknown };
  if (typeof candidate.id !== "string" || !isSaveId(candidate.id)) return null;
  if (typeof candidate.sourceUrl !== "string" || candidate.sourceUrl.length > 2048) return null;

  const sourceUrl = normalizeInstagramReelUrl(candidate.sourceUrl);
  return sourceUrl ? { id: candidate.id, sourceUrl } : null;
}

export function toSavedPlaceRecord(row: SavedReelRow): SavedPlaceRecord {
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

export function toSavedReelRow(save: ParsedSavedReel, userKey: string): NewSavedReelRow {
  const createdAt = new Date().toISOString();

  return {
    id: save.id,
    user_key: userKey,
    place_id: `saved-reel-${save.id}`,
    place_name: "Instagram Reel",
    area: "Saved Reel",
    source: "instagram",
    source_url: save.sourceUrl,
    creator_handle: null,
    raw_input: save.sourceUrl,
    confidence: 0,
    resolution_status: "pending",
    resolver_note: "Saved to your Rasa Map.",
    resolved_at: null,
    created_at: createdAt,
    updated_at: createdAt,
  };
}
