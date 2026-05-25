import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { ensureClerkUserByEmail } from "@/lib/clerk-provisioning";
import { cancelSubscriptionByStripeId, upsertSubscription } from "@/lib/db";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function asDate(unixSeconds?: number | null) {
  if (!unixSeconds) return null;
  return new Date(unixSeconds * 1000);
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripeClient().webhooks.constructEvent(body, signature, getStripeWebhookSecret());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid webhook signature." },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId = String(session.subscription || "");
      const checkoutEmail = session.customer_details?.email || session.customer_email || "";
      let provisionedUserId = session.metadata?.user_id || "";

      if (!provisionedUserId && checkoutEmail) {
        provisionedUserId = await ensureClerkUserByEmail(checkoutEmail);
      }

      if (subscriptionId) {
        const subscription = await getStripeClient().subscriptions.retrieve(subscriptionId) as Stripe.Subscription;
        await upsertSubscription({
          userId: subscription.metadata.user_id || provisionedUserId || null,
          anonId: subscription.metadata.anon_id || session.metadata?.anon_id || null,
          stripeCustomerId: String(subscription.customer),
          stripeSubscriptionId: subscription.id,
          plan: "pro",
          status: subscription.status,
          currentPeriodEnd: asDate((subscription as any).current_period_end ?? null),
        });
      }
    }

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      await upsertSubscription({
        userId: subscription.metadata.user_id || null,
        anonId: subscription.metadata.anon_id || null,
        stripeCustomerId: String(subscription.customer),
        stripeSubscriptionId: subscription.id,
        plan: "pro",
        status: subscription.status,
        currentPeriodEnd: asDate((subscription as any).current_period_end ?? null),
      });
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      await cancelSubscriptionByStripeId(subscription.id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook processing failed." },
      { status: 500 }
    );
  }
}
