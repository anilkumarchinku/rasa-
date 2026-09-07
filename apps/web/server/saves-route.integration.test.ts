import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { DELETE, GET, POST } from "../app/api/saves/route";
import type { NewSavedReelRow } from "./saved-reels/model";

test("saved-Reel API isolates a signed session and supports the full lifecycle", async (context) => {
  const originalFetch = globalThis.fetch;
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const originalSecret = process.env.RASA_SESSION_SECRET;
  const rows: NewSavedReelRow[] = [];

  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://supabase.test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_test";
  process.env.RASA_SESSION_SECRET = "route-test-session-secret";

  context.after(() => {
    globalThis.fetch = originalFetch;
    restoreEnvironment("NEXT_PUBLIC_SUPABASE_URL", originalUrl);
    restoreEnvironment("SUPABASE_SERVICE_ROLE_KEY", originalKey);
    restoreEnvironment("RASA_SESSION_SECRET", originalSecret);
  });

  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(String(input));
    const method = init.method ?? "GET";
    const headers = new Headers(init.headers);
    assert.equal(headers.get("apikey"), "sb_secret_test");

    const owner = url.searchParams.get("user_key")?.replace(/^eq\./, "");
    const sourceUrl = url.searchParams.get("source_url")?.replace(/^eq\./, "");
    const id = url.searchParams.get("id")?.replace(/^eq\./, "");
    const matchingRows = rows.filter(
      (row) =>
        (!owner || row.user_key === owner) &&
        (!sourceUrl || row.source_url === sourceUrl) &&
        (!id || row.id === id),
    );

    if (method === "HEAD") {
      return new Response(null, {
        headers: { "content-range": `0-0/${matchingRows.length}` },
        status: 200,
      });
    }

    if (method === "POST") {
      const row = JSON.parse(String(init.body)) as NewSavedReelRow;
      if (
        rows.some(
          (existing) =>
            existing.user_key === row.user_key && existing.source_url === row.source_url,
        )
      ) {
        return Response.json({ error: "duplicate" }, { status: 409 });
      }

      rows.push(row);
      return Response.json([row], { status: 201 });
    }

    if (method === "DELETE") {
      matchingRows.forEach((row) => rows.splice(rows.indexOf(row), 1));
      return new Response(null, { status: 204 });
    }

    return Response.json(matchingRows);
  };

  const sourceUrl = "https://www.instagram.com/reel/CRouteTest/";
  const createResponse = await POST(saveRequest("save-route123", sourceUrl));
  const createPayload = (await createResponse.json()) as {
    mode: string;
    save: { id: string; sourceUrl: string };
  };
  const cookie = createResponse.headers.get("set-cookie")?.split(";", 1)[0];

  assert.equal(createResponse.status, 200);
  assert.equal(createPayload.mode, "supabase");
  assert.equal(createPayload.save.sourceUrl, sourceUrl);
  assert.ok(cookie?.startsWith("rasa_saved_reels_session="));
  assert.equal(rows.length, 1);

  const duplicateResponse = await POST(saveRequest("save-route456", sourceUrl, cookie));
  const duplicatePayload = (await duplicateResponse.json()) as { save: { id: string } };
  assert.equal(duplicatePayload.save.id, "save-route123");
  assert.equal(rows.length, 1);

  const listResponse = await GET(
    new NextRequest("http://localhost/api/saves", { headers: { cookie: cookie ?? "" } }),
  );
  const listPayload = (await listResponse.json()) as { saves: Array<{ id: string }> };
  assert.deepEqual(
    listPayload.saves.map((save) => save.id),
    ["save-route123"],
  );

  const deleteResponse = await DELETE(
    new NextRequest("http://localhost/api/saves?id=save-route123", {
      headers: { cookie: cookie ?? "" },
      method: "DELETE",
    }),
  );
  assert.equal(deleteResponse.status, 200);
  assert.equal(rows.length, 0);
});

function saveRequest(id: string, sourceUrl: string, cookie?: string) {
  return new NextRequest("http://localhost/api/saves", {
    body: JSON.stringify({ save: { id, sourceUrl } }),
    headers: { "Content-Type": "application/json", cookie: cookie ?? "" },
    method: "POST",
  });
}

function restoreEnvironment(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}
