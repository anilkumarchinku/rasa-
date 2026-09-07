import assert from "node:assert/strict";
import test from "node:test";
import { parseSavedReel, toSavedReelRow } from "./model";

test("parseSavedReel accepts and normalizes Instagram Reel URLs", () => {
  const parsed = parseSavedReel({
    id: "save-12345678",
    sourceUrl: "https://www.instagram.com/reel/CRasaLaunch/?igsh=test#caption",
  });

  assert.deepEqual(parsed, {
    id: "save-12345678",
    sourceUrl: "https://www.instagram.com/reel/CRasaLaunch/?igsh=test",
  });
});

test("parseSavedReel rejects non-Reel and non-Instagram URLs", () => {
  assert.equal(
    parseSavedReel({ id: "save-12345678", sourceUrl: "https://instagram.com/p/photo" }),
    null,
  );
  assert.equal(
    parseSavedReel({ id: "save-12345678", sourceUrl: "https://example.com/reel/test" }),
    null,
  );
});

test("toSavedReelRow assigns ownership and server-controlled fields", () => {
  const row = toSavedReelRow(
    { id: "save-12345678", sourceUrl: "https://www.instagram.com/reel/CRasaLaunch/" },
    "anon-owner",
  );

  assert.equal(row.user_key, "anon-owner");
  assert.equal(row.source, "instagram");
  assert.equal(row.confidence, 0);
  assert.equal(row.resolution_status, "pending");
  assert.equal(row.source_url, row.raw_input);
});
