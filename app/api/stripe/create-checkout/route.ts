import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getProPriceId, getStripeClient } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Payload = {
  plan_id?: string;
  anon_id?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Payload;
    if (body.plan_id !== "pro") {
      return NextResponse.json({ error: "Plano inválido." }, { status: 400 });
    }

    const { userId } = await auth();
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const anonId = body.anon_id?.trim() || "";

    const session = await getStripeClient().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: getProPriceId(), quantity: 1 }],
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
      allow_promotion_codes: true,
      metadata: {
        plan: "pro",
        user_id: userId || "",
        anon_id: anonId,
      },
      subscription_data: {
        metadata: {
          plan: "pro",
          user_id: userId || "",
          anon_id: anonId,
        },
      },
    });

    return NextResponse.json({ checkout_url: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao criar checkout." },
      { status: 500 }
    );
  }
}
