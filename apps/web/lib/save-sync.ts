"use client";

import { savedPlacesStorageKey, type SavedPlaceRecord } from "@rasa/shared";

const cloudDeviceStorageKey = "rasa.cloud.device-id";

type CloudSaveResponse = {
  mode: "local" | "supabase";
  saves: SavedPlaceRecord[];
};

function createDeviceId() {
  return `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getCloudDeviceId() {
  const existing = window.localStorage.getItem(cloudDeviceStorageKey);

  if (existing) {
    return existing;
  }

  const nextId = createDeviceId();
  window.localStorage.setItem(cloudDeviceStorageKey, nextId);
  return nextId;
}

export function readLocalSaves() {
  const stored = window.localStorage.getItem(savedPlacesStorageKey);

  if (!stored) {
    return [];
  }

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
    const response = await fetch("/api/saves", {
      headers: {
        "x-rasa-device-id": getCloudDeviceId(),
      },
    });

    if (!response.ok) {
      return { mode: "local" as const, saves: localSaves };
    }

    const payload = (await response.json()) as CloudSaveResponse;

    if (payload.mode !== "supabase") {
      return { mode: "local" as const, saves: localSaves };
    }

    const mergedSaves = mergeSavedRecords(payload.saves, localSaves);
    writeLocalSaves(mergedSaves);
    return { mode: "supabase" as const, saves: mergedSaves };
  } catch {
    return { mode: "local" as const, saves: localSaves };
  }
}

export async function syncSavedRecord(save: SavedPlaceRecord) {
  try {
    await fetch("/api/saves", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rasa-device-id": getCloudDeviceId(),
      },
      body: JSON.stringify({ save }),
    });
  } catch {
    // Local saves remain the source of truth until cloud sync is available.
  }
}

export async function clearSavedRecords() {
  window.localStorage.removeItem(savedPlacesStorageKey);

  try {
    await fetch("/api/saves", {
      method: "DELETE",
      headers: {
        "x-rasa-device-id": getCloudDeviceId(),
      },
    });
  } catch {
    // Clearing local state should not depend on cloud availability.
  }
}
