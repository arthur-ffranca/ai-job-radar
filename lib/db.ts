import { Pool } from "@neondatabase/serverless";

import { getRequiredEnv } from "@/lib/env";

export type SubscriptionRow = {
  id: string;
  user_id: string | null;
  anon_id: string | null;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan: "free" | "pro";
  status: string;
  current_period_end: string | null;
  created_at: string;
};

export type UsageRow = {
  id: string;
  user_id: string | null;
  anon_id: string | null;
  total_analyses: number;
  updated_at: string;
};

let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: getRequiredEnv("DATABASE_URL") });
  }
  return pool;
}

export async function getActiveSubscription(params: {
  userId?: string | null;
  anonId?: string | null;
}): Promise<SubscriptionRow | null> {
  const values: string[] = [];
  const ors: string[] = [];
  if (params.userId) {
    values.push(params.userId);
    ors.push(`user_id = $${values.length}`);
  }
  if (params.anonId) {
    values.push(params.anonId);
    ors.push(`anon_id = $${values.length}`);
  }
  if (!ors.length) return null;

  const { rows } = await getPool().query<SubscriptionRow>(
    `select * from subscriptions
     where status in ('active','trialing') and (${ors.join(" OR ")})
     order by created_at desc
     limit 1`,
    values
  );
  return rows[0] ?? null;
}

export async function getUsage(params: {
  userId?: string | null;
  anonId?: string | null;
}): Promise<UsageRow | null> {
  const values: string[] = [];
  const ors: string[] = [];
  if (params.userId) {
    values.push(params.userId);
    ors.push(`user_id = $${values.length}`);
  }
  if (params.anonId) {
    values.push(params.anonId);
    ors.push(`anon_id = $${values.length}`);
  }
  if (!ors.length) return null;

  const { rows } = await getPool().query<UsageRow>(
    `select * from usage_limits where ${ors.join(" OR ")} order by updated_at desc limit 1`,
    values
  );
  return rows[0] ?? null;
}

export async function incrementUsage(params: {
  userId?: string | null;
  anonId?: string | null;
}) {
  const existing = await getUsage(params);
  if (existing) {
    await getPool().query(
      `update usage_limits set total_analyses = total_analyses + 1, updated_at = now() where id = $1`,
      [existing.id]
    );
    return;
  }

  await getPool().query(
    `insert into usage_limits (user_id, anon_id, total_analyses) values ($1, $2, 1)`,
    [params.userId || null, params.anonId || null]
  );
}

export async function upsertSubscription(input: {
  userId?: string | null;
  anonId?: string | null;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  plan: "free" | "pro";
  status: string;
  currentPeriodEnd?: Date | null;
}) {
  await getPool().query(
    `insert into subscriptions (
      user_id, anon_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end
    ) values ($1,$2,$3,$4,$5,$6,$7)
    on conflict (stripe_subscription_id)
    do update set
      user_id = excluded.user_id,
      anon_id = excluded.anon_id,
      plan = excluded.plan,
      status = excluded.status,
      current_period_end = excluded.current_period_end`,
    [
      input.userId || null,
      input.anonId || null,
      input.stripeCustomerId,
      input.stripeSubscriptionId,
      input.plan,
      input.status,
      input.currentPeriodEnd || null,
    ]
  );
}

export async function cancelSubscriptionByStripeId(subscriptionId: string) {
  await getPool().query(
    `update subscriptions set status = 'canceled', current_period_end = now() where stripe_subscription_id = $1`,
    [subscriptionId]
  );
}

