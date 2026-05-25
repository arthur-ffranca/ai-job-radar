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

function cleanProperties(value: unknown) {
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
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const eventName = cleanText(body.eventName, 120);

    if (!eventName) {
      return jsonResponse({ error: "eventName ausente." }, 400);
    }

    const { userId } = await auth();
    await createSiteEvent({
      eventName,
      userId: userId || null,
      anonId: cleanText(body.anonId, 120) || null,
      path: cleanText(body.path, 240) || null,
      properties: cleanProperties(body.properties),
    });

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error("[AI Job Radar] event capture failed", error);
    return jsonResponse({ ok: false }, 202);
  }
}
