"use client";

import posthog from "posthog-js";

import { getOrCreateAnonId } from "@/lib/client-id";

type TelemetryProps = Record<string, unknown>;

export function trackEvent(event: string, properties?: TelemetryProps) {
  if (typeof window === "undefined") {
    return;
  }

  const anonId = getOrCreateAnonId();
  const pathname = window.location.pathname;

  try {
    posthog.capture(event, properties);
  } catch (error) {
    console.warn("[AI Job Radar] telemetry capture failed", { event, error });
  }

  try {
    void fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      keepalive: true,
      body: JSON.stringify({
        eventName: event,
        anonId,
        path: pathname,
        properties: properties || {},
      }),
    });
  } catch (error) {
    console.warn("[AI Job Radar] first-party telemetry failed", { event, error });
  }
}
