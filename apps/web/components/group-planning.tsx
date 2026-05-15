"use client";

import {
  groupPlansStorageKey,
  hyderabadSeedPlaces,
  savedPlacesStorageKey,
  type GroupPlanRecord,
  type SavedPlaceRecord,
} from "@rasa/shared";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { trackRasaEvent } from "../lib/analytics";
import { getPlaceImage, HeroMedia, VisualImage } from "./visual-image";

function readJsonArray<T>(key: string) {
  const stored = window.localStorage.getItem(key);

  if (!stored) return [];

  try {
    return JSON.parse(stored) as T[];
  } catch {
    window.localStorage.removeItem(key);
    return [];
  }
}

function createPlanId() {
  return `group-plan-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function GroupPlanning() {
  const [plans, setPlans] = useState<GroupPlanRecord[]>([]);
  const [saves, setSaves] = useState<SavedPlaceRecord[]>([]);
  const [title, setTitle] = useState("Friday Night");
  const [hostName, setHostName] = useState("Varun");
  const [invitedCount, setInvitedCount] = useState(4);
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setPlans(readJsonArray<GroupPlanRecord>(groupPlansStorageKey));
    const storedSaves = readJsonArray<SavedPlaceRecord>(savedPlacesStorageKey);
    setSaves(storedSaves);
    setSelectedPlaceIds(
      (storedSaves.length
        ? storedSaves.map((save) => save.placeId)
        : hyderabadSeedPlaces.slice(0, 4).map((place) => place.id)
      ).slice(0, 4),
    );
    trackRasaEvent("page_view", { route: "/plan/group" });
  }, []);

  const candidatePlaces = useMemo(() => {
    const savedIds = new Set(saves.map((save) => save.placeId));
    const savedPlaces = hyderabadSeedPlaces.filter((place) => savedIds.has(place.id));
    return savedPlaces.length ? savedPlaces : hyderabadSeedPlaces.slice(0, 8);
  }, [saves]);

  function togglePlace(placeId: string) {
    setSelectedPlaceIds((current) =>
      current.includes(placeId)
        ? current.filter((id) => id !== placeId)
        : [...current, placeId].slice(0, 6),
    );
  }

  function createPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedPlaceIds.length < 2) {
      setMessage("Pick at least two places for group voting.");
      return;
    }

    const votes = Object.fromEntries(
      selectedPlaceIds.map((placeId, index) => [placeId, Math.max(1, invitedCount - index)]),
    );
    const winningPlaceId = selectedPlaceIds.reduce((winner, placeId) =>
      votes[placeId] > votes[winner] ? placeId : winner,
    );
    const winningPlace = hyderabadSeedPlaces.find((place) => place.id === winningPlaceId);
    const inviteText = `Vote on ${title} with me on Rasa. Leading pick: ${winningPlace?.name ?? "our saved place"}.`;
    const whatsappInviteUrl = `https://wa.me/?text=${encodeURIComponent(inviteText)}`;

    const nextPlan: GroupPlanRecord = {
      id: createPlanId(),
      title: title.trim() || "Group Plan",
      hostName: hostName.trim() || "Host",
      invitedCount,
      placeIds: selectedPlaceIds,
      votes,
      winningPlaceId,
      whatsappInviteUrl,
      status: "voting",
      createdAt: new Date().toISOString(),
    };

    const nextPlans = [nextPlan, ...plans];
    window.localStorage.setItem(groupPlansStorageKey, JSON.stringify(nextPlans));
    setPlans(nextPlans);
    setMessage("Group plan created with WhatsApp invite.");
    trackRasaEvent("group_plan_created", {
      route: "/plan/group",
      placeId: winningPlaceId,
      placeName: winningPlace?.name,
      metadata: {
        invitedCount,
        candidateCount: selectedPlaceIds.length,
      },
    });
  }

  const latestPlan = plans[0];

  return (
    <main className="group-plan-shell">
      <nav className="topbar" aria-label="Rasa navigation">
        <Link className="brand-lockup" href="/">
          <span className="brand-mark">R</span>
          <span>Rasa</span>
        </Link>
        <div className="nav-links">
          <Link href="/save">Save</Link>
          <Link href="/plan/group">Plan</Link>
          <Link href="/book/direct">Book</Link>
        </div>
      </nav>

      <section className="group-plan-hero">
        <div>
          <p className="eyebrow">Phase 2.1</p>
          <h1>Group planning with WhatsApp invites.</h1>
          <p className="lede">
            Turn saved places into a voting plan, pick a leading restaurant, and share a WhatsApp
            invite without losing the Rasa context.
          </p>
        </div>
        <HeroMedia alt="Group dining planning preview" imageKey="family">
          <div className="metric-row">
            <div>
              <span>Plans</span>
              <strong>{plans.length}</strong>
            </div>
            <div>
              <span>Candidates</span>
              <strong>{selectedPlaceIds.length}</strong>
            </div>
            <div>
              <span>Invites</span>
              <strong>{invitedCount}</strong>
            </div>
          </div>
        </HeroMedia>
      </section>

      {message && <p className="form-message group-plan-message">{message}</p>}

      <section className="group-plan-layout">
        <form className="group-plan-form" onSubmit={createPlan}>
          <div className="panel-heading">
            <p className="eyebrow">Create</p>
            <h2>Plan details</h2>
            <p>Select two to six places. The MVP simulates votes so the flow is testable now.</p>
          </div>
          <label>
            Plan name
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>
            Host name
            <input value={hostName} onChange={(event) => setHostName(event.target.value)} />
          </label>
          <label>
            Friends invited
            <input
              min={1}
              type="number"
              value={invitedCount}
              onChange={(event) => setInvitedCount(Number(event.target.value))}
            />
          </label>
          <button type="submit">Create WhatsApp plan</button>
        </form>

        <section className="group-place-picker">
          {candidatePlaces.map((place) => (
            <button
              className={selectedPlaceIds.includes(place.id) ? "group-place active" : "group-place"}
              key={place.id}
              onClick={() => togglePlace(place.id)}
              type="button"
            >
              <VisualImage
                alt={`${place.name} group plan preview`}
                className="card-visual"
                src={getPlaceImage(place.id)}
              />
              <span>{place.area}</span>
              <strong>{place.name}</strong>
              <em>{place.heroDish}</em>
            </button>
          ))}
        </section>

        <aside className="group-plan-summary">
          <div className="panel-heading">
            <p className="eyebrow">Latest plan</p>
            <h2>{latestPlan?.title ?? "No plan yet"}</h2>
          </div>
          {latestPlan ? (
            <div className="summary-list">
              <div>
                <span>Status</span>
                <strong>{latestPlan.status}</strong>
              </div>
              <div>
                <span>Winning place</span>
                <strong>
                  {
                    hyderabadSeedPlaces.find((place) => place.id === latestPlan.winningPlaceId)
                      ?.name
                  }
                </strong>
              </div>
              <div>
                <span>Friends</span>
                <strong>{latestPlan.invitedCount}</strong>
              </div>
              <a className="text-link" href={latestPlan.whatsappInviteUrl}>
                Open WhatsApp invite
              </a>
            </div>
          ) : (
            <p className="place-address">Create a plan to generate the WhatsApp invite.</p>
          )}
        </aside>
      </section>
    </main>
  );
}
