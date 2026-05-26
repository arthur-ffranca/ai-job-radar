import { currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { getInternalMetrics } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function adminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function metricsResponse() {
  try {
    const metrics = await getInternalMetrics();
    return NextResponse.json(metrics, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Metrics query failed.",
        detail: error instanceof Error ? error.message : "Unknown metrics error.",
        hint: "Run POST /api/internal/setup-db with x-internal-token to create metrics tables.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const internalToken = process.env.INTERNAL_METRICS_TOKEN || "";
  const headerToken = (await headers()).get("x-internal-token") || "";

  if (internalToken && headerToken === internalToken) {
    return metricsResponse();
  }

  const allowedEmails = adminEmails();
  if (!allowedEmails.length) {
    const metrics = await getInternalMetrics();
    return NextResponse.json(
      {
        ...metrics,
        accessMode: "open-temporary",
        warning:
          "ADMIN_EMAILS/INTERNAL_METRICS_TOKEN não configurados. Endpoint liberado temporariamente em modo leitura.",
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || "";
  if (!email || !allowedEmails.includes(email)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  return metricsResponse();
}
