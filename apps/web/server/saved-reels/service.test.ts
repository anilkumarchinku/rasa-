import assert from "node:assert/strict";
import test from "node:test";
import type { NewSavedReelRow, SavedReelRow } from "./model";
import {
  maxSavedReelsPerSession,
  SavedReelLimitError,
  SavedReelsService,
  type SavedReelsStore,
} from "./service";

function savedReelRow(id: string, sourceUrl: string): SavedReelRow {
  return {
    id,
    place_id: `saved-reel-${id}`,
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
    created_at: "2026-09-07T00:00:00.000Z",
  };
}

class FakeSavedReelsStore implements SavedReelsStore {
  rows: SavedReelRow[] = [];
  total = 0;
  insertCount = 0;

  async listByOwner() {
    return this.rows;
  }

  async findByOwnerAndSourceUrl(_userKey: string, sourceUrl: string) {
    return this.rows.find((row) => row.source_url === sourceUrl) ?? null;
  }

  async countByOwner() {
    return this.total;
  }

  async insert(row: NewSavedReelRow) {
    this.insertCount += 1;
    const saved = savedReelRow(row.id, row.source_url ?? "");
    this.rows.push(saved);
    return saved;
  }

  async removeByOwner() {}
}

test("save returns an existing Reel instead of inserting a duplicate", async () => {
  const store = new FakeSavedReelsStore();
  const sourceUrl = "https://www.instagram.com/reel/CRasaLaunch/";
  store.rows = [savedReelRow("save-existing1", sourceUrl)];
  const service = new SavedReelsService(store);

  const result = await service.save("anon-owner", { id: "save-newreel12", sourceUrl });

  assert.equal(result.id, "save-existing1");
  assert.equal(store.insertCount, 0);
});

test("save enforces the per-session limit", async () => {
  const store = new FakeSavedReelsStore();
  store.total = maxSavedReelsPerSession;
  const service = new SavedReelsService(store);

  await assert.rejects(
    service.save("anon-owner", {
      id: "save-limitreel1",
      sourceUrl: "https://www.instagram.com/reel/CLimit/",
    }),
    SavedReelLimitError,
  );
});

test("save inserts a new Reel below the limit", async () => {
  const store = new FakeSavedReelsStore();
  const service = new SavedReelsService(store);

  const result = await service.save("anon-owner", {
    id: "save-newreel12",
    sourceUrl: "https://www.instagram.com/reel/CNew/",
  });

  assert.equal(result.id, "save-newreel12");
  assert.equal(store.insertCount, 1);
});
