"use client";

import {
  analyticsEventsStorageKey,
  type AnalyticsEventName,
  type AnalyticsEventRecord,
} from "@rasa/shared";

function createEventId() {
  return `event-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function readAnalyticsEvents() {
  const stored = window.localStorage.getItem(analyticsEventsStorageKey);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as AnalyticsEventRecord[];
  } catch {
    window.localStorage.removeItem(analyticsEventsStorageKey);
    return [];
  }
}

export function trackRasaEvent(
  eventName: AnalyticsEventName,
  payload: Omit<AnalyticsEventRecord, "id" | "eventName" | "createdAt">,
) {
  const nextEvent: AnalyticsEventRecord = {
    id: createEventId(),
    eventName,
    createdAt: new Date().toISOString(),
    ...payload,
  };

  const events = readAnalyticsEvents();
  window.localStorage.setItem(analyticsEventsStorageKey, JSON.stringify([nextEvent, ...events]));
  window.dispatchEvent(new CustomEvent("rasa:analytics-event", { detail: nextEvent }));

  return nextEvent;
}
