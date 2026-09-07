import type { SupabaseAdminConfig } from "../config";
import { supabaseRest, supabaseRestJson } from "../supabase-rest";
import type { NewSavedReelRow, SavedReelRow } from "./model";

function savedReelsPath(parameters: Record<string, string>) {
  return `saved_places?${new URLSearchParams(parameters).toString()}`;
}

export class SavedReelsRepository {
  constructor(private readonly config: SupabaseAdminConfig) {}

  listByOwner(userKey: string, limit: number) {
    return supabaseRestJson<SavedReelRow[]>(
      this.config,
      savedReelsPath({
        limit: String(limit),
        order: "created_at.desc",
        select: "*",
        user_key: `eq.${userKey}`,
      }),
    );
  }

  async findByOwnerAndSourceUrl(userKey: string, sourceUrl: string): Promise<SavedReelRow | null> {
    const rows = await supabaseRestJson<SavedReelRow[]>(
      this.config,
      savedReelsPath({
        limit: "1",
        select: "*",
        source_url: `eq.${sourceUrl}`,
        user_key: `eq.${userKey}`,
      }),
    );

    return rows[0] ?? null;
  }

  async countByOwner(userKey: string) {
    const response = await supabaseRest(
      this.config,
      savedReelsPath({ select: "id", user_key: `eq.${userKey}` }),
      { headers: { Prefer: "count=exact", Range: "0-0" }, method: "HEAD" },
    );
    const match = response.headers.get("content-range")?.match(/\/(\d+)$/);

    if (!match) throw new Error("Supabase did not return a saved-Reel count.");
    return Number(match[1]);
  }

  async insert(row: NewSavedReelRow) {
    const rows = await supabaseRestJson<SavedReelRow[]>(this.config, "saved_places", {
      body: JSON.stringify(row),
      headers: { "Content-Type": "application/json", Prefer: "return=representation" },
      method: "POST",
    });

    if (!rows[0]) throw new Error("Supabase did not return the saved Reel.");
    return rows[0];
  }

  async removeByOwner(userKey: string, id?: string) {
    const parameters: Record<string, string> = { user_key: `eq.${userKey}` };
    if (id) parameters.id = `eq.${id}`;

    await supabaseRest(this.config, savedReelsPath(parameters), { method: "DELETE" });
  }
}
