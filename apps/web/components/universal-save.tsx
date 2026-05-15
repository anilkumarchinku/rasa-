"use client";

import {
  parseSaveInput,
  savedPlacesStorageKey,
  type InstagramResolverResult,
  type ParsedSaveInput,
  type SavedPlaceRecord,
} from "@rasa/shared";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { trackRasaEvent } from "../lib/analytics";
import { getPlaceImage, getRouteImage, VisualImage } from "./visual-image";

const sampleInputs = [
  {
    label: "Instagram",
    value: "https://www.instagram.com/reel/demo Bawarchi RTC X Roads via @hyderabadfoodie",
  },
  {
    label: "YouTube",
    value: "YouTube short: Shah Ghouse Tolichowki mutton biryani @biryani_diaries",
  },
  {
    label: "WhatsApp",
    value: "WhatsApp forward: Try Roastery Coffee House Banjara Hills this weekend",
  },
];

function createSaveId() {
  return `save-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createPendingPlaceId(source: SavedPlaceRecord["source"]) {
  return `pending-${source}-${Date.now()}`;
}

function readSavedRecords() {
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

export function UniversalSave() {
  const [rawInput, setRawInput] = useState("");
  const [parsed, setParsed] = useState<ParsedSaveInput | null>(null);
  const [saves, setSaves] = useState<SavedPlaceRecord[]>([]);
  const [error, setError] = useState("");
  const [resolverMessage, setResolverMessage] = useState("");

  useEffect(() => {
    setSaves(readSavedRecords());
    trackRasaEvent("page_view", { route: "/save" });
  }, []);

  const latestSave = saves[0];

  const saveStats = useMemo(
    () => [
      ["Saved", String(saves.length)],
      ["Matched", String(saves.filter((save) => save.confidence >= 0.9).length)],
      ["Creators", String(new Set(saves.map((save) => save.creatorHandle).filter(Boolean)).size)],
    ],
    [saves],
  );

  function persistSaves(nextSaves: SavedPlaceRecord[]) {
    window.localStorage.setItem(savedPlacesStorageKey, JSON.stringify(nextSaves));
    setSaves(nextSaves);
  }

  async function runResolver(save: SavedPlaceRecord, currentSaves: SavedPlaceRecord[]) {
    if (!save.sourceUrl || save.resolutionStatus !== "pending" || save.source !== "instagram") {
      return;
    }

    setResolverMessage("Resolver running: metadata → OCR → AI place match.");

    try {
      const response = await fetch("/api/instagram/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: save.sourceUrl }),
      });
      const result = (await response.json()) as InstagramResolverResult;

      const updatedSave: SavedPlaceRecord =
        result.status === "resolved" && result.place
          ? {
              ...save,
              placeId: result.place.id,
              placeName: result.place.name,
              area: result.place.area,
              creatorHandle: result.creatorHandle ?? save.creatorHandle,
              confidence: result.confidence,
              resolutionStatus: "matched",
              resolverNote: result.note,
              resolvedAt: new Date().toISOString(),
            }
          : {
              ...save,
              creatorHandle: result.creatorHandle ?? save.creatorHandle,
              confidence: result.confidence,
              resolutionStatus: result.status === "review" ? "review" : "pending",
              resolverNote: result.note,
            };

      persistSaves(currentSaves.map((record) => (record.id === save.id ? updatedSave : record)));
      setResolverMessage(
        updatedSave.resolutionStatus === "matched"
          ? `Resolved: ${updatedSave.placeName} is ready on your map.`
          : "Saved to your personal list. Rasa will keep resolving this Reel in the background.",
      );
    } catch {
      setResolverMessage("Saved to your personal list. Resolver will retry later.");
    }
  }

  function saveRecommendation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedInput = rawInput.trim();

    if (!trimmedInput) {
      setError("Paste an Instagram link, creator link, forward, or place note first.");
      setParsed(null);
      return;
    }

    const nextParsed = parseSaveInput(trimmedInput);
    const matchedPlace = nextParsed.matchedPlace;
    const canSavePendingLink = Boolean(nextParsed.url) && nextParsed.source !== "unknown";

    setParsed(nextParsed);
    trackRasaEvent("save_parsed", {
      route: "/save",
      placeId: matchedPlace?.id,
      placeName: matchedPlace?.name,
      creatorHandle: nextParsed.creatorHandle,
      metadata: {
        confidence: nextParsed.confidence,
        source: nextParsed.source,
        matched: Boolean(matchedPlace),
      },
    });

    if (!matchedPlace && !canSavePendingLink) {
      setError("Rasa needs a valid link to save this without a place match.");
      return;
    }

    const nextSave: SavedPlaceRecord = {
      id: createSaveId(),
      placeId: matchedPlace?.id ?? createPendingPlaceId(nextParsed.source),
      placeName: matchedPlace?.name ?? "Instagram Reel",
      area: matchedPlace?.area ?? "Auto resolving",
      source: nextParsed.source,
      sourceUrl: nextParsed.url,
      creatorHandle: nextParsed.creatorHandle,
      rawInput: trimmedInput,
      confidence: nextParsed.confidence,
      resolutionStatus: matchedPlace ? "matched" : "pending",
      resolverNote: matchedPlace
        ? "Resolved from pasted text."
        : "Queued for the automatic Instagram resolver.",
      resolvedAt: matchedPlace ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
    };

    const nextSaves = [nextSave, ...saves];
    persistSaves(nextSaves);
    trackRasaEvent("save_created", {
      route: "/save",
      placeId: matchedPlace?.id,
      placeName: matchedPlace?.name ?? nextSave.placeName,
      creatorHandle: nextSave.creatorHandle,
      metadata: {
        confidence: nextSave.confidence,
        source: nextSave.source,
        pending: nextSave.resolutionStatus === "pending",
      },
    });
    setRawInput("");
    setError(
      matchedPlace ? "" : "Saved. Rasa is automatically identifying the restaurant from this link.",
    );
    void runResolver(nextSave, nextSaves);
  }

  function clearSaves() {
    window.localStorage.removeItem(savedPlacesStorageKey);
    setSaves([]);
    setParsed(null);
    setError("");
  }

  return (
    <main className="save-shell">
      <nav className="topbar" aria-label="Rasa navigation">
        <Link className="brand-lockup" href="/">
          <span className="brand-mark">R</span>
          <span>Rasa</span>
        </Link>
        <div className="nav-links">
          <Link href="/save">Save</Link>
          <Link href="/places">Places</Link>
        </div>
      </nav>

      <section className="save-hero">
        <div>
          <p className="eyebrow">Phase 0.5</p>
          <h1>Save a creator recommendation before it disappears.</h1>
          <p className="lede">
            Paste a creator link, YouTube note, WhatsApp forward, or manual place text. Rasa detects
            the source, creator handle, and seed place attribution.
          </p>
        </div>
        <div className="hero-media-stack">
          <div className="visual-card">
            <VisualImage
              alt="Saved food recommendation preview"
              className="responsive-visual"
              priority
              src={getRouteImage("save")}
            />
          </div>
          <div className="metric-row">
            {saveStats.map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="save-layout" aria-label="Universal Save workflow">
        <form className="save-panel primary-save-panel" onSubmit={saveRecommendation}>
          <div className="panel-heading">
            <p className="eyebrow">Paste</p>
            <h2>Paste once, save immediately</h2>
            <p>
              Rasa saves the link even when Instagram does not expose the restaurant yet. Matched
              places become map pins; unresolved Reel links move into the map's auto-resolving
              inbox.
            </p>
          </div>

          <div className="step-rail" aria-label="Save steps">
            <span className={rawInput ? "step-dot active" : "step-dot"}>Paste</span>
            <span className={parsed ? "step-dot active" : "step-dot"}>Parse</span>
            <span className={latestSave ? "step-dot active" : "step-dot"}>Saved</span>
          </div>

          <label>
            Creator link or note
            <textarea
              placeholder="Paste an Instagram Reel URL, YouTube link, WhatsApp forward, or place note..."
              value={rawInput}
              onChange={(event) => setRawInput(event.target.value)}
            />
          </label>

          <div className="sample-row">
            {sampleInputs.map((sample) => (
              <button
                className="sample-button"
                key={sample.label}
                type="button"
                onClick={() => {
                  setRawInput(sample.value);
                  setParsed(null);
                  setError("");
                }}
              >
                {sample.label}
              </button>
            ))}
          </div>

          {error && <p className="error-text">{error}</p>}
          {resolverMessage && <p className="form-message">{resolverMessage}</p>}

          <div className="button-row">
            <button className="secondary-button" type="button" onClick={clearSaves}>
              Clear saves
            </button>
            <button type="submit">Save recommendation</button>
          </div>
        </form>

        <aside
          className={
            parsed?.matchedPlace ? "save-panel match-panel matched" : "save-panel match-panel"
          }
        >
          <div className="panel-heading">
            <p className="eyebrow">Attribution</p>
            <h2>{parsed?.matchedPlace ? parsed.matchedPlace.name : "Waiting for a match"}</h2>
            <p>
              {parsed?.matchedPlace
                ? "Looks good. Save it with the creator signal attached."
                : parsed?.url
                  ? "The link is saved and queued for automatic restaurant detection."
                  : "Paste a recommendation to preview attribution."}
            </p>
          </div>

          <div className="summary-list">
            <div>
              <span>Source</span>
              <strong>{parsed?.source ?? "None"}</strong>
            </div>
            <div>
              <span>Creator</span>
              <strong>{parsed?.creatorHandle ? `@${parsed.creatorHandle}` : "Not detected"}</strong>
            </div>
            <div>
              <span>Confidence</span>
              <strong>{parsed ? `${Math.round(parsed.confidence * 100)}%` : "0%"}</strong>
            </div>
          </div>

          {parsed?.matchedPlace && (
            <>
              <VisualImage
                alt={`${parsed.matchedPlace.name} matched place preview`}
                className="card-visual"
                src={getPlaceImage(parsed.matchedPlace.id)}
              />
              <div className="matched-place-strip">
                <span>{parsed.matchedPlace.area}</span>
                <strong>{parsed.matchedPlace.heroDish}</strong>
              </div>
              <div className="tag-row">
                {parsed.matchedPlace.cuisines.map((cuisine) => (
                  <span key={cuisine}>{cuisine}</span>
                ))}
              </div>
            </>
          )}
          {parsed?.url && !parsed.matchedPlace && (
            <div className="matched-place-strip pending-strip">
              <span>Queued for automatic detection</span>
              <strong>{parsed.source} link</strong>
            </div>
          )}
        </aside>
      </section>

      <section className="saved-list" aria-label="Saved places">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Saved</p>
            <h2>Local saved recommendations</h2>
            <p className="hint">Matched places show as pins. Plain Reel links auto-resolve.</p>
          </div>
          {latestSave && <p className="hint">Latest: {latestSave.placeName}</p>}
        </div>
        <div className="places-grid">
          {saves.map((save) => (
            <article className="place-card" key={save.id}>
              <div>
                <p className="place-area">{save.area}</p>
                <h2>{save.placeName}</h2>
                <p className="place-address">{save.rawInput}</p>
              </div>
              <div className="place-meta">
                <span>
                  {save.resolutionStatus === "pending"
                    ? "Auto resolving"
                    : `${Math.round(save.confidence * 100)}% match`}
                </span>
                <span>{save.sourceUrl ? "Link saved" : save.placeId}</span>
              </div>
              {save.resolverNote && <p className="hint">{save.resolverNote}</p>}
              <div className="tag-row">
                <span>{save.source}</span>
                {save.creatorHandle && <span>@{save.creatorHandle}</span>}
              </div>
              <p className="coordinates">{new Date(save.createdAt).toLocaleString("en-IN")}</p>
            </article>
          ))}
          {saves.length === 0 && (
            <article className="place-card">
              <div>
                <p className="place-area">Empty</p>
                <h2>No saves yet</h2>
                <p className="place-address">
                  Parse a sample or paste a creator recommendation to create your first local save.
                </p>
              </div>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
