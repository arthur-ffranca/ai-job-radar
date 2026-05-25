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

export type ReportFeedbackRow = {
  id: string;
  user_id: string | null;
  anon_id: string | null;
  analysis_id: string | null;
  target_role: string | null;
  match_score: number | null;
  rating: number | null;
  comment: string;
  use_case: string;
  created_at: string;
};

export type SiteEventRow = {
  id: string;
  event_name: string;
  user_id: string | null;
  anon_id: string | null;
  path: string | null;
  properties: Record<string, unknown>;
  created_at: string;
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

export async function createReportFeedback(input: {
  userId?: string | null;
  anonId?: string | null;
  analysisId?: string | null;
  targetRole?: string | null;
  matchScore?: number | null;
  rating?: number | null;
  comment?: string | null;
  useCase?: string | null;
}) {
  const { rows } = await getPool().query<ReportFeedbackRow>(
    `insert into report_feedback (
      user_id, anon_id, analysis_id, target_role, match_score, rating, comment, use_case
    ) values ($1,$2,$3,$4,$5,$6,$7,$8)
    returning *`,
    [
      input.userId || null,
      input.anonId || null,
      input.analysisId || null,
      input.targetRole || null,
      input.matchScore ?? null,
      input.rating ?? null,
      input.comment || "",
      input.useCase || "",
    ]
  );

  return rows[0];
}

export async function createSiteEvent(input: {
  eventName: string;
  userId?: string | null;
  anonId?: string | null;
  path?: string | null;
  properties?: Record<string, unknown> | null;
}) {
  const { rows } = await getPool().query<SiteEventRow>(
    `insert into site_events (event_name, user_id, anon_id, path, properties)
     values ($1,$2,$3,$4,$5)
     returning *`,
    [
      input.eventName,
      input.userId || null,
      input.anonId || null,
      input.path || null,
      JSON.stringify(input.properties || {}),
    ]
  );

  return rows[0];
}

export async function getInternalMetrics() {
  const [daily, funnel, feedback] = await Promise.all([
    getPool().query<{
      day: string;
      page_views: number;
      unique_visitors: number;
      analyses_started: number;
      analyses_completed: number;
    }>(
      `select
        date_trunc('day', created_at)::text as day,
        count(*) filter (where event_name = 'page_viewed')::int as page_views,
        count(distinct coalesce(user_id, anon_id)) filter (where event_name = 'page_viewed')::int as unique_visitors,
        count(*) filter (where event_name = 'analysis_started')::int as analyses_started,
        count(*) filter (where event_name = 'analysis_success')::int as analyses_completed
       from site_events
       where created_at >= now() - interval '30 days'
       group by 1
       order by 1 desc`
    ),
    getPool().query<{
      event_name: string;
      total_events: number;
      unique_visitors: number;
    }>(
      `select
        event_name,
        count(*)::int as total_events,
        count(distinct coalesce(user_id, anon_id))::int as unique_visitors
       from site_events
       where created_at >= now() - interval '30 days'
         and event_name in ('page_viewed', 'demo_opened', 'cv_upload_success', 'analysis_started', 'analysis_success')
       group by event_name
       order by total_events desc`
    ),
    getPool().query<ReportFeedbackRow>(
      `select *
       from report_feedback
       order by created_at desc
       limit 100`
    ),
  ]);

  return {
    daily: daily.rows,
    funnel: funnel.rows,
    feedback: feedback.rows,
  };
}
