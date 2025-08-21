
-- 1) Create validation_logs table for accuracy and buy-link audits
create table if not exists public.validation_logs (
  id uuid primary key default gen_random_uuid(),
  domain text not null,
  source text not null,         -- e.g., 'spaceship', 'rdap', 'buy_link'
  status text,                  -- e.g., 'ok', 'mismatch', '404', 'error', 'invalid'
  message text,
  created_at timestamptz not null default now()
);

-- Helpful indexes for querying issues quickly
create index if not exists validation_logs_domain_idx on public.validation_logs (domain);
create index if not exists validation_logs_created_at_idx on public.validation_logs (created_at desc);

-- 2) Enable RLS
alter table public.validation_logs enable row level security;

-- 3) Service role can manage everything (edge functions use service role to write logs)
drop policy if exists "service_role_all_validation_logs" on public.validation_logs;
create policy "service_role_all_validation_logs"
  on public.validation_logs
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- 4) Admins can read logs
drop policy if exists "admins_can_select_validation_logs" on public.validation_logs;
create policy "admins_can_select_validation_logs"
  on public.validation_logs
  for select
  using (exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  ));
