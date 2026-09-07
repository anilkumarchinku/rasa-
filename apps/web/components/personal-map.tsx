"use client";

import { getSeedPlaceById, type SavedPlaceRecord } from "@rasa/shared";
import { ExternalLink, MapPinned, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { deleteSavedRecord, loadSavedRecords, writeLocalSaves } from "../lib/save-sync";
import { Button, ButtonLink } from "./ui/button";

const hyderabadStaticMapUrl = "/images/hyderabad-static-map.svg";

const mapBounds = {
  minLat: 17.34,
  maxLat: 17.45,
  minLng: 78.38,
  maxLng: 78.51,
};

function getPinPosition(latitude: number, longitude: number) {
  const x = ((longitude - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
  const y = 100 - ((latitude - mapBounds.minLat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;

  return {
    left: `${Math.min(94, Math.max(6, x))}%`,
    top: `${Math.min(92, Math.max(8, y))}%`,
  };
}

export function PersonalMap() {
  const [saves, setSaves] = useState<SavedPlaceRecord[]>([]);
  const [syncMode, setSyncMode] = useState<"local" | "supabase">("local");
  const [selectedSaveId, setSelectedSaveId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void loadSavedRecords().then(({ mode, saves: loadedSaves }) => {
      setSyncMode(mode);
      setSaves(loadedSaves);
    });
  }, []);

  const selectedSave = saves.find((save) => save.id === selectedSaveId) ?? saves[0];
  const mappedSaves = useMemo(
    () =>
      saves
        .map((save) => ({ place: getSeedPlaceById(save.placeId), save }))
        .filter(
          (
            value,
          ): value is {
            place: NonNullable<ReturnType<typeof getSeedPlaceById>>;
            save: SavedPlaceRecord;
          } => Boolean(value.place),
        ),
    [saves],
  );

  async function removeSave(id: string) {
    setRemovingId(id);
    const removed = await deleteSavedRecord(id);

    if (removed || syncMode === "local") {
      const nextSaves = saves.filter((save) => save.id !== id);
      writeLocalSaves(nextSaves);
      setSaves(nextSaves);
      setSelectedSaveId(null);
    } else {
      setMessage("Could not remove this saved Reel. Please try again.");
    }

    setRemovingId(null);
  }

  return (
    <main className="map-shell">
      <section className="map-hero">
        <div>
          <p className="eyebrow">Your Rasa Map</p>
          <h1>Every Reel you meant to remember.</h1>
          <p className="lede">
            This is your private saved-Reel map. Rasa keeps the original Instagram link ready for
            your next plan, without guessing a restaurant location.
          </p>
        </div>
        <div className="metric-row">
          <div>
            <span>Saved Reels</span>
            <strong>{saves.length}</strong>
          </div>
          <div>
            <span>Exact locations</span>
            <strong>{mappedSaves.length}</strong>
          </div>
          <div>
            <span>Storage</span>
            <strong>{syncMode === "supabase" ? "Cloud" : "This device"}</strong>
          </div>
        </div>
      </section>

      <section className="map-workspace">
        <section className="map-canvas-panel" aria-label="Rasa saved Reels map">
          <div className="map-canvas">
            <div
              aria-label="Hyderabad map background"
              className="static-hyd-map"
              role="img"
              style={{ backgroundImage: `url(${hyderabadStaticMapUrl})` }}
            />
            <div className="map-grid-lines" />
            <div className="saved-reel-map-summary">
              <MapPinned aria-hidden="true" />
              <div>
                <span>Private saved Reels</span>
                <strong>{saves.length} ready for your next plan</strong>
              </div>
            </div>
            {mappedSaves.map(({ place, save }) => (
              <button
                aria-label={`Show ${place.name}`}
                className="map-pin saved-pin"
                key={save.id}
                onClick={() => setSelectedSaveId(save.id)}
                style={getPinPosition(place.latitude, place.longitude)}
                type="button"
              >
                <span>S</span>
              </button>
            ))}
          </div>
          <div className="map-legend">
            <span>
              <i className="legend-dot saved" /> Exact location saved
            </span>
            <span>
              {saves.length} Reel{saves.length === 1 ? "" : "s"} in your map
            </span>
          </div>
        </section>

        <aside className="selected-place-panel">
          {selectedSave ? (
            <>
              <div className="panel-heading">
                <p className="eyebrow">Saved Instagram Reel</p>
                <h2>Your food find is safe here.</h2>
                <p>{selectedSave.sourceUrl}</p>
              </div>
              <div className="summary-list">
                <div>
                  <span>Saved</span>
                  <strong>{new Date(selectedSave.createdAt).toLocaleString("en-IN")}</strong>
                </div>
                <div>
                  <span>Location</span>
                  <strong>Not guessed</strong>
                </div>
              </div>
              <a
                className="maps-link"
                href={selectedSave.sourceUrl}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink />
                Open Instagram Reel
              </a>
              <Button
                className="w-full"
                disabled={removingId === selectedSave.id}
                onClick={() => void removeSave(selectedSave.id)}
                variant="outline"
              >
                <Trash2 />
                Remove from map
              </Button>
            </>
          ) : (
            <div className="panel-heading">
              <p className="eyebrow">Nothing saved yet</p>
              <h2>Your next food plan starts with a Reel.</h2>
              <p>Paste an Instagram Reel link and it will appear here immediately.</p>
              <ButtonLink href="/save">
                <MapPinned />
                Save a Reel
              </ButtonLink>
            </div>
          )}
        </aside>
      </section>

      {message && <p className="error-text">{message}</p>}

      <section className="saved-list" aria-label="All saved Instagram Reels">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Saved on your map</p>
            <h2>Open a Reel when it is time to decide.</h2>
          </div>
          <Link className="text-link" href="/save">
            Save another Reel
          </Link>
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
                  onClick={() => setSelectedSaveId(save.id)}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  View
                </Button>
              </div>
            </article>
          ))}
          {saves.length === 0 && (
            <article className="place-card">
              <div>
                <p className="place-area">Your Rasa Map</p>
                <h2>It is waiting for your first food Reel.</h2>
                <p className="place-address">Paste the link. Rasa will keep it here.</p>
              </div>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
