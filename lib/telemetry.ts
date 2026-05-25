"use client";

import posthog from "posthog-js";

type TelemetryProps = Record<string, unknown>;

export function trackEvent(event: string, properties?: TelemetryProps) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    posthog.capture(event, properties);
  } catch (error) {
    console.warn("[AI Job Radar] telemetry capture failed", { event, error });
  }
}

