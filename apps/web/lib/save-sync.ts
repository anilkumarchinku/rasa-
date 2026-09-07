"use client";

import { savedPlacesStorageKey, type SavedPlaceRecord } from "@rasa/shared";

type CloudSaveResponse = {
  mode: "local" | "supabase";
  save?: SavedPlaceRecord;
  saves?: SavedPlaceRecord[];
};

export function readLocalSaves() {
  const stored = window.localStorage.getItem(savedPlacesStorageKey);

  if (!stored) return [];

  try {
    return JSON.parse(stored) as SavedPlaceRecord[];
  } catch {
    window.localStorage.removeItem(savedPlacesStorageKey);
    return [];
  }
}

export function writeLocalSaves(saves: SavedPlaceRecord[]) {
  window.localStorage.setItem(savedPlacesStorageKey, JSON.stringify(saves));
}

export function mergeSavedRecords(...groups: SavedPlaceRecord[][]) {
  const byId = new Map<string, SavedPlaceRecord>();

  groups.flat().forEach((save) => {
    const existing = byId.get(save.id);

    if (!existing || new Date(save.createdAt).getTime() >= new Date(existing.createdAt).getTime()) {
      byId.set(save.id, save);
    }
  });

  return Array.from(byId.values()).sort(
    (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
  );
}

export async function loadSavedRecords() {
  const localSaves = readLocalSaves();

  try {
    const response = await fetch("/api/saves", { cache: "no-store" });

    if (!response.ok) return { mode: "local" as const, saves: localSaves };

    const payload = (await response.json()) as CloudSaveResponse;

    if (payload.mode !== "supabase" || !payload.saves) {
      return { mode: "local" as const, saves: localSaves };
    }

    const saves = mergeSavedRecords(payload.saves, localSaves);
    writeLocalSaves(saves);
    return { mode: "supabase" as const, saves };
  } catch {
    return { mode: "local" as const, saves: localSaves };
  }
}

export async function syncSavedRecord(save: SavedPlaceRecord) {
  try {
    const response = await fetch("/api/saves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ save }),
    });

    if (!response.ok) return { mode: "local" as const, save };

    const payload = (await response.json()) as CloudSaveResponse;
    return { mode: payload.mode, save: payload.save ?? save };
  } catch {
    return { mode: "local" as const, save };
  }
}

export async function deleteSavedRecord(id: string) {
  try {
    const response = await fetch(`/api/saves?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    return response.ok;
  } catch {
    return false;
  }
}

export async function clearSavedRecords() {
  try {
    const response = await fetch("/api/saves", { method: "DELETE" });
    return response.ok;
  } catch {
    return false;
  }
}
