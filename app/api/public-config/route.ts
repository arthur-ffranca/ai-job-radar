import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(
    {
      posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY || "",
      posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
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

