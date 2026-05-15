"use client";

import {
  getSeedPlaceById,
  hyderabadSeedPlaces,
  type PhaseZeroCuisine,
  type SavedPlaceRecord,
  type SaveSource,
} from "@rasa/shared";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadSavedRecords } from "../lib/save-sync";
import { getPlaceImage, getRouteImage, VisualImage } from "./visual-image";

type FilterValue = "all";

type EnrichedSave = SavedPlaceRecord & {
  place: NonNullable<ReturnType<typeof getSeedPlaceById>>;
};

const mapBounds = {
  minLat: 17.34,
  maxLat: 17.45,
  minLng: 78.38,
  maxLng: 78.51,
};

const saturdayReminderStorageKey = "rasa.reminders.saturday-saved-spots";

function getPinPosition(latitude: number, longitude: number) {
  const x = ((longitude - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
  const y = 100 - ((latitude - mapBounds.minLat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;

  return {
    left: `${Math.min(94, Math.max(6, x))}%`,
    top: `${Math.min(92, Math.max(8, y))}%`,
  };
}

function uniqueValues<T extends string>(values: T[]) {
  return Array.from(new Set(values));
}

export function PersonalMap() {
  const [saves, setSaves] = useState<SavedPlaceRecord[]>([]);
  const [saturdayReminderEnabled, setSaturdayReminderEnabled] = useState(true);
  const [activeArea, setActiveArea] = useState<string | FilterValue>("all");
  const [activeSource, setActiveSource] = useState<SaveSource | FilterValue>("all");
  const [activeCuisine, setActiveCuisine] = useState<PhaseZeroCuisine | FilterValue>("all");
  const [selectedSaveId, setSelectedSaveId] = useState<string | null>(null);
  const [syncMode, setSyncMode] = useState<"local" | "supabase">("local");

  useEffect(() => {
    void loadSavedRecords().then(({ mode, saves: loadedSaves }) => {
      setSyncMode(mode);
      setSaves(loadedSaves);
    });
    const storedReminder = window.localStorage.getItem(saturdayReminderStorageKey);
    setSaturdayReminderEnabled(storedReminder ? storedReminder === "enabled" : true);
  }, []);

  const enrichedSaves = useMemo(
    () =>
      saves
        .map((save) => {
          const place = getSeedPlaceById(save.placeId);

          if (!place) {
            return null;
          }

          return { ...save, place };
        })
        .filter((save): save is EnrichedSave => Boolean(save)),
    [saves],
  );

  const pendingSaves = useMemo(
    () =>
      saves.filter(
        (save) => save.resolutionStatus === "pending" || !getSeedPlaceById(save.placeId),
      ),
    [saves],
  );

  const filterOptions = useMemo(
    () => ({
      areas: uniqueValues(enrichedSaves.map((save) => save.place.area)),
      sources: uniqueValues(enrichedSaves.map((save) => save.source)),
      cuisines: uniqueValues(enrichedSaves.flatMap((save) => [...save.place.cuisines])),
    }),
    [enrichedSaves],
  );

  const filteredSaves = enrichedSaves.filter((save) => {
    const areaMatch = activeArea === "all" || save.place.area === activeArea;
    const sourceMatch = activeSource === "all" || save.source === activeSource;
    const cuisineMatch =
      activeCuisine === "all" || save.place.cuisines.some((cuisine) => cuisine === activeCuisine);

    return areaMatch && sourceMatch && cuisineMatch;
  });

  const selectedSave = filteredSaves.find((save) => save.id === selectedSaveId) ?? filteredSaves[0];

  function resetFilters() {
    setActiveArea("all");
    setActiveSource("all");
    setActiveCuisine("all");
    setSelectedSaveId(null);
  }

  function toggleSaturdayReminder() {
    const nextValue = !saturdayReminderEnabled;
    setSaturdayReminderEnabled(nextValue);
    window.localStorage.setItem(saturdayReminderStorageKey, nextValue ? "enabled" : "disabled");
  }

  return (
    <main className="map-shell">
      <nav className="topbar" aria-label="Rasa navigation">
        <Link className="brand-lockup" href="/">
          <span className="brand-mark">R</span>
          <span>Rasa</span>
        </Link>
        <div className="nav-links">
          <Link href="/save">Save</Link>
          <Link href="/map">Map</Link>
          <Link href="/places">Places</Link>
        </div>
      </nav>

      <section className="map-hero">
        <div>
          <p className="eyebrow">Phase 0.6</p>
          <h1>Your saved Hyderabad, finally visible.</h1>
          <p className="lede">
            A lightweight personal map for the places you saved from creator recommendations. Pins
            are generated from Phase 0 seed coordinates until Mapbox is wired.
          </p>
        </div>
        <div className="hero-media-stack">
          <div className="visual-card">
            <VisualImage
              alt="Personal map discovery preview"
              className="responsive-visual"
              priority
              src={getRouteImage("map")}
            />
          </div>
          <div className="metric-row">
            <div>
              <span>Saved</span>
              <strong>{saves.length}</strong>
            </div>
            <div>
              <span>Mapped</span>
              <strong>{filteredSaves.length}</strong>
            </div>
            <div>
              <span>Auto resolving</span>
              <strong>{pendingSaves.length}</strong>
            </div>
            <div>
              <span>Sync</span>
              <strong>{syncMode === "supabase" ? "Cloud" : "Local"}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="saved-list reminder-card" aria-label="Saturday saved spots reminder">
        <div>
          <p className="eyebrow">Saturday reminder</p>
          <h2>Hey, which spot are we reaching today?</h2>
          <p className="hint">
            Every Saturday, Rasa should remind the user to open this personal list and pick from
            saved spots.
          </p>
        </div>
        <div className="reminder-actions">
          <span>{saturdayReminderEnabled ? "Reminder on" : "Reminder off"}</span>
          <button className="secondary-button" type="button" onClick={toggleSaturdayReminder}>
            {saturdayReminderEnabled ? "Turn off" : "Turn on"}
          </button>
        </div>
      </section>

      <section className="map-workspace">
        <aside className="map-controls">
          <div className="panel-heading">
            <p className="eyebrow">Filters</p>
            <h2>Find the right saved place</h2>
            <p>Filter by area, source, or cuisine. The cards and pins stay in sync.</p>
          </div>

          <label>
            Area
            <select value={activeArea} onChange={(event) => setActiveArea(event.target.value)}>
              <option value="all">All areas</option>
              {filterOptions.areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </label>

          <label>
            Source
            <select
              value={activeSource}
              onChange={(event) => setActiveSource(event.target.value as SaveSource | FilterValue)}
            >
              <option value="all">All sources</option>
              {filterOptions.sources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </label>

          <label>
            Cuisine
            <select
              value={activeCuisine}
              onChange={(event) =>
                setActiveCuisine(event.target.value as PhaseZeroCuisine | FilterValue)
              }
            >
              <option value="all">All cuisines</option>
              {filterOptions.cuisines.map((cuisine) => (
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </select>
          </label>

          <button type="button" className="secondary-button" onClick={resetFilters}>
            Reset filters
          </button>
        </aside>

        <section className="map-canvas-panel" aria-label="Saved places map">
          <div className="map-canvas">
            <div className="map-grid-lines" />
            <span className="map-zone zone-west">Tolichowki</span>
            <span className="map-zone zone-central">Central</span>
            <span className="map-zone zone-east">Banjara/Jubilee</span>

            {hyderabadSeedPlaces.map((place) => {
              const hasVisibleSave = filteredSaves.some((save) => save.placeId === place.id);
              const position = getPinPosition(place.latitude, place.longitude);

              return (
                <button
                  aria-label={place.name}
                  className={hasVisibleSave ? "map-pin saved-pin" : "map-pin seed-pin"}
                  key={place.id}
                  style={position}
                  type="button"
                  onClick={() => {
                    const matchingSave = filteredSaves.find((save) => save.placeId === place.id);
                    setSelectedSaveId(matchingSave?.id ?? null);
                  }}
                >
                  <span>{hasVisibleSave ? "S" : ""}</span>
                </button>
              );
            })}
          </div>
          <div className="map-legend">
            <span>
              <i className="legend-dot saved" /> Saved
            </span>
            <span>
              <i className="legend-dot seed" /> Seed place
            </span>
          </div>
        </section>

        <aside className="selected-place-panel">
          {selectedSave ? (
            <>
              <VisualImage
                alt={`${selectedSave.place.name} selected map place`}
                className="card-visual"
                src={getPlaceImage(selectedSave.place.id)}
              />
              <div className="panel-heading">
                <p className="eyebrow">{selectedSave.place.area}</p>
                <h2>{selectedSave.place.name}</h2>
                <p>{selectedSave.place.address}</p>
              </div>
              <div className="matched-place-strip">
                <span>Saved from {selectedSave.source}</span>
                <strong>{selectedSave.place.heroDish}</strong>
              </div>
              <div className="tag-row">
                {selectedSave.place.cuisines.map((cuisine) => (
                  <span key={cuisine}>{cuisine}</span>
                ))}
              </div>
              <div className="summary-list">
                <div>
                  <span>Creator</span>
                  <strong>
                    {selectedSave.creatorHandle ? `@${selectedSave.creatorHandle}` : "Not detected"}
                  </strong>
                </div>
                <div>
                  <span>Saved</span>
                  <strong>{new Date(selectedSave.createdAt).toLocaleString("en-IN")}</strong>
                </div>
              </div>
            </>
          ) : (
            <div className="panel-heading">
              <p className="eyebrow">{pendingSaves.length ? "Resolving" : "Empty"}</p>
              <h2>
                {pendingSaves.length ? "Reel links are being identified" : "No saved places yet"}
              </h2>
              <p>
                {pendingSaves.length
                  ? "Plain Instagram links appear below until Rasa identifies the restaurant and adds a map pin."
                  : "Save a place first, then come back to see it on your personal map."}
              </p>
              <Link className="text-link" href="/save">
                Save a place
              </Link>
            </div>
          )}
        </aside>
      </section>

      {pendingSaves.length > 0 && (
        <section className="saved-list resolver-inbox" aria-label="Auto resolving Reel links">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Auto resolver</p>
              <h2>Reel links waiting for restaurant detection</h2>
              <p className="hint">
                In production this queue is processed by Rasa's metadata, OCR, and AI resolver.
              </p>
            </div>
            <p className="hint">{pendingSaves.length} resolving</p>
          </div>
          <div className="places-grid">
            {pendingSaves.map((save) => (
              <article className="place-card resolver-card" key={save.id}>
                <div>
                  <p className="place-area">{save.area}</p>
                  <h2>{save.placeName}</h2>
                  <p className="place-address">{save.sourceUrl ?? save.rawInput}</p>
                </div>
                <div className="matched-place-strip pending-strip">
                  <span>Automatic process</span>
                  <strong>Metadata → OCR → AI place match → map pin</strong>
                </div>
                <div className="tag-row">
                  <span>{save.source}</span>
                  <span>Queued</span>
                </div>
                <p className="coordinates">{new Date(save.createdAt).toLocaleString("en-IN")}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="saved-list" aria-label="Personal saved list">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Personal list</p>
            <h2>Everything you saved</h2>
            <p className="hint">
              Use this before hangouts. Map pins are ready; Reel links marked auto resolving are
              still being identified.
            </p>
          </div>
          <p className="hint">{saves.length} saved</p>
        </div>
        <div className="places-grid">
          {saves.map((save) => {
            const place = getSeedPlaceById(save.placeId);
            const isPending = save.resolutionStatus === "pending" || !place;

            return (
              <article
                className={isPending ? "place-card resolver-card" : "place-card"}
                key={save.id}
              >
                {place && (
                  <VisualImage
                    alt={`${place.name} personal saved spot`}
                    className="card-visual"
                    src={getPlaceImage(place.id)}
                  />
                )}
                <div>
                  <p className="place-area">{isPending ? "Auto resolving" : place.area}</p>
                  <h2>{isPending ? save.placeName : place.name}</h2>
                  <p className="place-address">{save.sourceUrl ?? save.rawInput}</p>
                </div>
                <div className={isPending ? "matched-place-strip pending-strip" : "place-meta"}>
                  {isPending ? (
                    <>
                      <span>Automatic process</span>
                      <strong>{save.resolverNote ?? "Finding restaurant from Reel link"}</strong>
                    </>
                  ) : (
                    <>
                      <span>{place.heroDish}</span>
                      <span>{Math.round(save.confidence * 100)}% match</span>
                    </>
                  )}
                </div>
                <div className="tag-row">
                  <span>{save.source}</span>
                  <span>{isPending ? "Queued" : "Map pin ready"}</span>
                  {save.creatorHandle && <span>@{save.creatorHandle}</span>}
                </div>
                {save.resolvedAt && (
                  <p className="hint">
                    Resolved {new Date(save.resolvedAt).toLocaleString("en-IN")}
                  </p>
                )}
                <p className="coordinates">{new Date(save.createdAt).toLocaleString("en-IN")}</p>
              </article>
            );
          })}
          {saves.length === 0 && (
            <article className="place-card">
              <div>
                <p className="place-area">Empty</p>
                <h2>No saved spots yet</h2>
                <p className="place-address">
                  Paste a Reel link on `/save`; it will appear here even while auto resolving.
                </p>
              </div>
            </article>
          )}
        </div>
      </section>

      <section className="saved-list" aria-label="Mapped saved place cards">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Cards</p>
            <h2>Map-ready saved spots</h2>
            <p className="hint">Tap a card to highlight its pin on the map.</p>
          </div>
          <p className="hint">{filteredSaves.length} visible</p>
        </div>
        <div className="places-grid">
          {filteredSaves.map((save) => (
            <button
              className={
                save.id === selectedSave?.id
                  ? "place-card map-place-card active"
                  : "place-card map-place-card"
              }
              key={save.id}
              type="button"
              onClick={() => setSelectedSaveId(save.id)}
            >
              <VisualImage
                alt={`${save.place.name} saved place`}
                className="card-visual"
                src={getPlaceImage(save.place.id)}
              />
              <div>
                <p className="place-area">{save.place.area}</p>
                <h2>{save.place.name}</h2>
                <p className="place-address">{save.rawInput}</p>
              </div>
              <div className="place-meta">
                <span>{save.place.heroDish}</span>
                <span>{Math.round(save.confidence * 100)}% match</span>
              </div>
              <div className="tag-row">
                <span>{save.source}</span>
                {save.creatorHandle && <span>@{save.creatorHandle}</span>}
              </div>
            </button>
          ))}
          {filteredSaves.length === 0 && (
            <article className="place-card">
              <div>
                <p className="place-area">No results</p>
                <h2>Nothing matches these filters</h2>
                <p className="place-address">Reset filters or save another place from `/save`.</p>
              </div>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
