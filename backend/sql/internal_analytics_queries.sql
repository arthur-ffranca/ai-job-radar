-- Consultas internas. Execute somente no banco privado do AI Job Radar.

-- Acessos unicos por dia, usando usuario logado quando existir e anon_id quando nao.
select
  date_trunc('day', created_at) as day,
  count(*) filter (where event_name = 'page_viewed') as page_views,
  count(distinct coalesce(user_id, anon_id)) filter (where event_name = 'page_viewed') as unique_visitors,
  count(*) filter (where event_name = 'analysis_started') as analyses_started,
  count(*) filter (where event_name = 'analysis_success') as analyses_completed
from site_events
where created_at >= now() - interval '30 days'
group by 1
order by 1 desc;

-- Feedbacks recebidos, mais recentes primeiro.
select
  created_at,
  rating,
  target_role,
  match_score,
  comment,
  use_case,
  analysis_id,
  coalesce(user_id, anon_id) as visitor_id
from report_feedback
order by created_at desc
limit 100;

-- Funil simples dos ultimos 30 dias.
select
  event_name,
  count(*) as total_events,
  count(distinct coalesce(user_id, anon_id)) as unique_visitors
from site_events
where created_at >= now() - interval '30 days'
  and event_name in ('page_viewed', 'demo_opened', 'cv_upload_success', 'analysis_started', 'analysis_success')
group by event_name
order by total_events desc;
