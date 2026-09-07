"use client";

import type { SavedPlaceRecord } from "@rasa/shared";
import { BookmarkPlus, ExternalLink, MapPinned, Trash2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { normalizeInstagramReelUrl } from "../lib/instagram-url";
import {
  clearSavedRecords,
  deleteSavedRecord,
  loadSavedRecords,
  mergeSavedRecords,
  syncSavedRecord,
  writeLocalSaves,
} from "../lib/save-sync";
import { Button, ButtonLink } from "./ui/button";
import { getRouteImage, VisualImage } from "./visual-image";

function createSaveId() {
  return `save-${globalThis.crypto.randomUUID().replace(/-/g, "")}`;
}

export function UniversalSave() {
  const [rawInput, setRawInput] = useState("");
  const [saves, setSaves] = useState<SavedPlaceRecord[]>([]);
  const [message, setMessage] = useState("");
  const [syncMode, setSyncMode] = useState<"local" | "supabase">("local");
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    void loadSavedRecords().then(({ mode, saves: loadedSaves }) => {
      setSyncMode(mode);
      setSaves(loadedSaves);
    });
  }, []);

  const latestSave = saves[0];
  const summary = useMemo(
    () => [
      ["Saved Reels", String(saves.length)],
      ["Private map", "Ready"],
      ["Storage", syncMode === "supabase" ? "Cloud" : "This device"],
    ],
    [saves.length, syncMode],
  );

  function persist(nextSaves: SavedPlaceRecord[]) {
    writeLocalSaves(nextSaves);
    setSaves(nextSaves);
  }

  async function saveReel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const sourceUrl = normalizeInstagramReelUrl(rawInput);

    if (!sourceUrl) {
      setMessage("Paste a full Instagram Reel link. It should begin with instagram.com/reel/.");
      return;
    }

    setSaving(true);
    setMessage("");

    const nextSave: SavedPlaceRecord = {
      id: createSaveId(),
      placeId: "saved-reel",
      placeName: "Instagram Reel",
      area: "Saved Reel",
      source: "instagram",
      sourceUrl,
      rawInput: sourceUrl,
      confidence: 0,
      resolutionStatus: "pending",
      resolverNote: "Saved to your Rasa Map.",
      createdAt: new Date().toISOString(),
    };

    const optimisticSaves = [nextSave, ...saves];
    persist(optimisticSaves);
    setRawInput("");

    const result = await syncSavedRecord(nextSave);
    setSyncMode(result.mode);
    persist(mergeSavedRecords([result.save], saves));
    setMessage(
      result.mode === "supabase"
        ? "Saved privately to your Rasa Map."
        : "Saved on this device. Cloud sync will resume when Rasa is connected.",
    );
    setSaving(false);
  }

  async function removeSave(id: string) {
    setRemovingId(id);
    const removed = await deleteSavedRecord(id);

    if (removed || syncMode === "local") {
      persist(saves.filter((save) => save.id !== id));
    } else {
      setMessage("Could not remove this saved Reel. Please try again.");
    }

    setRemovingId(null);
  }

  async function clearSaves() {
    const cleared = await clearSavedRecords();

    if (cleared || syncMode === "local") {
      persist([]);
      setMessage("Your saved Reels are cleared.");
    } else {
      setMessage("Could not clear cloud saves. Please try again.");
    }
  }

  return (
    <main className="save-shell">
      <section className="save-hero">
        <div>
          <p className="eyebrow">Rasa Saved Reels</p>
          <h1>Save the food Reel. Find it when you are hungry.</h1>
          <p className="lede">
            Paste an Instagram Reel link once. Rasa keeps it in your private Hyderabad map so it
            does not disappear into your Instagram saves.
          </p>
        </div>
        <div className="hero-media-stack">
          <div className="visual-card">
            <VisualImage
              alt="Friends sharing a restaurant meal"
              className="responsive-visual"
              priority
              src={getRouteImage("save")}
            />
          </div>
          <div className="metric-row">
            {summary.map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="save-layout" aria-label="Save Instagram Reel">
        <form className="save-panel primary-save-panel" onSubmit={saveReel}>
          <div className="panel-heading">
            <p className="eyebrow">One simple thing</p>
            <h2>Paste a Reel. Keep the plan.</h2>
            <p>Only Instagram Reel links are supported in this first Rasa release.</p>
          </div>

          <label>
            Instagram Reel link
            <input
              autoComplete="url"
              inputMode="url"
              onChange={(event) => setRawInput(event.target.value)}
              placeholder="https://www.instagram.com/reel/..."
              required
              type="url"
              value={rawInput}
            />
          </label>

          {message && (
            <div className="form-message action-message" role="status">
              <p>{message}</p>
              {latestSave && <Link href="/map">Open your Rasa Map</Link>}
            </div>
          )}

          <div className="button-row">
            <Button disabled={saving} type="submit">
              <BookmarkPlus />
              {saving ? "Saving..." : "Save to my map"}
            </Button>
            <Button
              disabled={saves.length === 0}
              onClick={() => void clearSaves()}
              type="button"
              variant="outline"
            >
              <Trash2 />
              Clear
            </Button>
          </div>
        </form>

        <aside className="save-panel match-panel">
          <div className="panel-heading">
            <p className="eyebrow">What happens next</p>
            <h2>It stays with you.</h2>
            <p>
              The Reel is stored under a private browser session. Open the Map any time to see
              everything you saved and reopen the original Reel.
            </p>
          </div>
          <div className="summary-list">
            <div>
              <span>Link saved</span>
              <strong>Immediately</strong>
            </div>
            <div>
              <span>Restaurant location</span>
              <strong>Coming next</strong>
            </div>
            <div>
              <span>Who can see it</span>
              <strong>Only you</strong>
            </div>
          </div>
          <ButtonLink className="w-full" href="/map" variant="outline">
            <MapPinned />
            See my map
          </ButtonLink>
        </aside>
      </section>

      <section className="saved-list" aria-label="Saved Instagram Reels">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Your saved Reels</p>
            <h2>Do not lose a good food find again.</h2>
          </div>
          <p className="hint">{saves.length} saved</p>
        </div>
        <div className="places-grid">
          {saves.map((save) => (
            <article className="place-card" key={save.id}>
              <div>
                <p className="place-area">Instagram Reel</p>
                <h2>Saved food find</h2>
                <p className="place-address">{save.sourceUrl}</p>
              </div>
              <p className="hint">Saved {new Date(save.createdAt).toLocaleString("en-IN")}</p>
              <div className="card-footer-row">
                <a className="text-button" href={save.sourceUrl} rel="noreferrer" target="_blank">
                  <ExternalLink />
                  Open Reel
                </a>
                <Button
                  disabled={removingId === save.id}
                  onClick={() => void removeSave(save.id)}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 />
                  Remove
                </Button>
              </div>
            </article>
          ))}
          {saves.length === 0 && (
            <article className="place-card">
              <div>
                <p className="place-area">Your map is empty</p>
                <h2>Paste your first Reel above.</h2>
                <p className="place-address">That is all this first version asks you to do.</p>
              </div>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
