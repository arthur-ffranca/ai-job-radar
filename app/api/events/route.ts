import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { createSiteEvent } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: NO_STORE_HEADERS,
  });
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanProperties(value: unknown): Record<string, string | number | boolean | null> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(([, entry]) => {
      return (
        typeof entry === "string" ||
        typeof entry === "number" ||
        typeof entry === "boolean" ||
        entry === null
      );
    })
  ) as Record<string, string | number | boolean | null>;
}

async function forwardToPostHog(input: {
  eventName: string;
  distinctId: string;
  path: string;
  properties: Record<string, string | number | boolean | null>;
}) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  if (!key) {
    return;
  }

  const payload = {
    api_key: key,
    event: input.eventName,
    properties: {
      distinct_id: input.distinctId,
      $current_url: input.path,
      ...input.properties,
    },
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(`${host}/e/?ip=1&_=${Date.now()}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch (error) {
    console.warn("[AI Job Radar] posthog forward failed", error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const eventName = cleanText(body.eventName, 120);

    if (!eventName) {
      return jsonResponse({ error: "eventName ausente." }, 400);
    }

    const { userId } = await auth();
    const anonId = cleanText(body.anonId, 120) || null;
    const path = cleanText(body.path, 240) || null;
    const props = cleanProperties(body.properties);

    await createSiteEvent({
      eventName,
      userId: userId || null,
      anonId,
      path,
      properties: props,
    });

    await forwardToPostHog({
      eventName,
      distinctId: userId || anonId || "anonymous",
      path: path || "/",
      properties: props,
    });

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error("[AI Job Radar] event capture failed", error);
    return jsonResponse({ ok: false }, 202);
  }
}
