import type { SavedPlaceRecord } from "@rasa/shared";
import { SupabaseRestError } from "../supabase-rest";
import { toSavedPlaceRecord, toSavedReelRow, type ParsedSavedReel } from "./model";
import type { SavedReelsRepository } from "./repository";

export const maxSavedReelsPerSession = 100;

export class SavedReelLimitError extends Error {
  constructor() {
    super(`A browser session can save up to ${maxSavedReelsPerSession} Reels.`);
    this.name = "SavedReelLimitError";
  }
}

export type SavedReelsStore = Pick<
  SavedReelsRepository,
  "countByOwner" | "findByOwnerAndSourceUrl" | "insert" | "listByOwner" | "removeByOwner"
>;

export class SavedReelsService {
  constructor(private readonly repository: SavedReelsStore) {}

  async list(userKey: string): Promise<SavedPlaceRecord[]> {
    const rows = await this.repository.listByOwner(userKey, maxSavedReelsPerSession);
    return rows.map(toSavedPlaceRecord);
  }

  async save(userKey: string, save: ParsedSavedReel): Promise<SavedPlaceRecord> {
    const existing = await this.repository.findByOwnerAndSourceUrl(userKey, save.sourceUrl);
    if (existing) return toSavedPlaceRecord(existing);

    const count = await this.repository.countByOwner(userKey);
    if (count >= maxSavedReelsPerSession) throw new SavedReelLimitError();

    try {
      return toSavedPlaceRecord(await this.repository.insert(toSavedReelRow(save, userKey)));
    } catch (error) {
      if (error instanceof SupabaseRestError && error.status === 409) {
        const duplicate = await this.repository.findByOwnerAndSourceUrl(userKey, save.sourceUrl);
        if (duplicate) return toSavedPlaceRecord(duplicate);
      }

      throw error;
    }
  }

  remove(userKey: string, id?: string) {
    return this.repository.removeByOwner(userKey, id);
  }
}
