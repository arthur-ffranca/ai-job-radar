import { currentUser } from "@clerk/nextjs/server";
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

export async function GET() {
  const allowedEmails = adminEmails();
  if (!allowedEmails.length) {
    return NextResponse.json({ error: "Admin access is not configured." }, { status: 403 });
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || "";
  if (!email || !allowedEmails.includes(email)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const metrics = await getInternalMetrics();
  return NextResponse.json(metrics, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
