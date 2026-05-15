"use client";

import {
  getSeedPlaceById,
  savedPlacesStorageKey,
  type InstagramResolverResult,
  type SavedPlaceRecord,
} from "@rasa/shared";

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

export function saveFromResolverResult(
  save: SavedPlaceRecord,
  result: InstagramResolverResult,
): SavedPlaceRecord {
  if (result.status === "resolved" && result.place) {
    return {
      ...save,
      area: result.place.area,
      confidence: result.confidence,
      creatorHandle: result.creatorHandle ?? save.creatorHandle,
      placeId: result.place.id,
      placeName: result.place.name,
      resolutionStatus: "matched",
      resolvedAt: new Date().toISOString(),
      resolverNote: result.note,
    };
  }

  return {
    ...save,
    area: result.extractedArea ?? save.area,
    confidence: result.confidence,
    creatorHandle: result.creatorHandle ?? save.creatorHandle,
    placeName: result.extractedPlaceName ?? save.placeName,
    resolutionStatus: result.status === "review" ? "review" : "pending",
    resolverNote: result.note,
  };
}

export async function retryPendingSavedRecords(saves: SavedPlaceRecord[]) {
  const nextSaves = await Promise.all(
    saves.map(async (save) => {
      const hasMapPin = Boolean(getSeedPlaceById(save.placeId));

      if (hasMapPin || save.source !== "instagram" || !save.sourceUrl) {
        return save;
      }

      try {
        const response = await fetch("/api/instagram/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: save.sourceUrl }),
        });

        if (!response.ok) {
          return save;
        }

        const result = (await response.json()) as InstagramResolverResult;
        const updatedSave = saveFromResolverResult(save, result);
        await syncSavedRecord(updatedSave);
        return updatedSave;
      } catch {
        return save;
      }
    }),
  );

  writeLocalSaves(nextSaves);
  return nextSaves;
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
