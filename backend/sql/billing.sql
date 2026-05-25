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

