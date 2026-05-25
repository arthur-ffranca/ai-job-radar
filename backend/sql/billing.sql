create extension if not exists "pgcrypto";

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id text null,
  anon_id text null,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  plan text not null check (plan in ('free','pro')),
  status text not null,
  current_period_end timestamptz null,
  created_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on subscriptions(user_id);
create index if not exists subscriptions_anon_id_idx on subscriptions(anon_id);
create index if not exists subscriptions_status_idx on subscriptions(status);

create table if not exists usage_limits (
  id uuid primary key default gen_random_uuid(),
  user_id text null,
  anon_id text null,
  total_analyses integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists usage_limits_user_id_idx on usage_limits(user_id);
create index if not exists usage_limits_anon_id_idx on usage_limits(anon_id);

create table if not exists report_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id text null,
  anon_id text null,
  analysis_id text null,
  target_role text null,
  match_score integer null,
  rating integer null check (rating between 1 and 5),
  comment text not null default '',
  use_case text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists report_feedback_user_id_idx on report_feedback(user_id);
create index if not exists report_feedback_anon_id_idx on report_feedback(anon_id);
create index if not exists report_feedback_analysis_id_idx on report_feedback(analysis_id);
create index if not exists report_feedback_created_at_idx on report_feedback(created_at desc);

create table if not exists site_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  user_id text null,
  anon_id text null,
  path text null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists site_events_event_name_idx on site_events(event_name);
create index if not exists site_events_user_id_idx on site_events(user_id);
create index if not exists site_events_anon_id_idx on site_events(anon_id);
create index if not exists site_events_created_at_idx on site_events(created_at desc);
