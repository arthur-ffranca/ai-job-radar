import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { initializeDatabaseSchema } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function authorized(token: string) {
  return Boolean(token) && token === process.env.INTERNAL_METRICS_TOKEN;
}

export async function POST() {
  const token = (await headers()).get("x-internal-token") || "";
  if (!authorized(token)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  await initializeDatabaseSchema();
  return NextResponse.json({ ok: true });
}
