alter table public.rescue_devices
  add column if not exists operational_status text not null default 'available',
  add column if not exists safety_status text not null default 'safe_confirmed',
  add column if not exists safe_due_at timestamptz,
  add column if not exists sos_status text not null default 'none',
  add column if not exists sos_raised_at timestamptz,
  add column if not exists sos_acknowledged_at timestamptz,
  add column if not exists sos_resolved_at timestamptz,
  add column if not exists last_internet_at timestamptz;

update public.rescue_devices
set operational_status = case
  when mission_status = 'active' then 'on_mission'
  when mission_status = 'returning' then 'returning'
  when mission_status = 'ended' then 'off_duty'
  when mission_status in ('safe','sos') and active_mission_id is not null then 'on_mission'
  when mission_status in ('safe','sos') then 'available'
  when mission_status = 'pending' then 'available'
  else coalesce(nullif(operational_status,''),'available') end,
safety_status = case
  when sos = true or mission_status = 'sos' then 'sos'
  when mission_status = 'safe' or last_safe_at is not null then 'safe_confirmed'
  else coalesce(nullif(safety_status,''),'safe_confirmed') end,
sos_status = case when sos = true or mission_status = 'sos' then 'raised' else coalesce(nullif(sos_status,''),'none') end,
sos_raised_at = case when (sos = true or mission_status = 'sos') and sos_raised_at is null then coalesce(updated_at, now()) else sos_raised_at end,
safe_due_at = case when active_mission_id is not null then coalesce(last_safe_at, mission_started_at, now()) + interval '8 hours' else safe_due_at end;

alter table public.rescue_locations add column if not exists client_event_id text;
create unique index if not exists rescue_locations_device_client_event_uidx on public.rescue_locations(device_id, client_event_id) where client_event_id is not null;

alter table public.rescue_mission_photos add column if not exists uploaded_at timestamptz;
update public.rescue_mission_photos set uploaded_at = coalesce(uploaded_at, created_at) where uploaded_at is null;

create table if not exists public.rescue_assets (
 id uuid primary key default gen_random_uuid(), asset_type text not null, name text not null, identifier text,
 team_id uuid references public.rescue_teams(id), active boolean not null default true,
 last_lat double precision,last_long double precision,last_accuracy double precision,last_seen_at timestamptz,
 metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create index if not exists rescue_assets_team_idx on public.rescue_assets(team_id);
create index if not exists rescue_assets_type_active_idx on public.rescue_assets(asset_type, active);
alter table public.rescue_assets enable row level security;

create table if not exists public.rescue_assignments (
 id uuid primary key default gen_random_uuid(), incident_id text not null, incident_name text,
 team_id uuid references public.rescue_teams(id), device_id uuid references public.rescue_devices(id), area text, task text,
 meeting_point text,safe_route text,asset_id uuid references public.rescue_assets(id),status text not null default 'assigned',
 assigned_by uuid,assigned_at timestamptz not null default now(),accepted_at timestamptz,completed_at timestamptz,
 metadata jsonb not null default '{}'::jsonb,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create index if not exists rescue_assignments_device_status_idx on public.rescue_assignments(device_id,status);
create index if not exists rescue_assignments_team_status_idx on public.rescue_assignments(team_id,status);
alter table public.rescue_assignments enable row level security;

create table if not exists public.rescue_checkins (
 id uuid primary key default gen_random_uuid(),device_id uuid not null references public.rescue_devices(id),mission_id uuid references public.rescue_missions(id),
 assignment_id uuid references public.rescue_assignments(id),checkin_type text not null,note text,latitude double precision,longitude double precision,
 accuracy double precision,battery integer,captured_at timestamptz not null,received_at timestamptz not null default now(),client_event_id text,
 metadata jsonb not null default '{}'::jsonb);
create unique index if not exists rescue_checkins_device_client_event_uidx on public.rescue_checkins(device_id,client_event_id) where client_event_id is not null;
create index if not exists rescue_checkins_device_captured_idx on public.rescue_checkins(device_id,captured_at desc);
alter table public.rescue_checkins enable row level security;

create table if not exists public.rescue_sos_events (
 id uuid primary key default gen_random_uuid(),device_id uuid not null references public.rescue_devices(id),mission_id uuid references public.rescue_missions(id),
 status text not null default 'raised',operational_status text,latitude double precision,longitude double precision,accuracy double precision,battery integer,
 last_internet_at timestamptz,raised_at timestamptz not null,acknowledged_at timestamptz,acknowledged_by uuid,resolved_at timestamptz,resolved_by uuid,
 client_event_id text,payload jsonb not null default '{}'::jsonb,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create unique index if not exists rescue_sos_device_client_event_uidx on public.rescue_sos_events(device_id,client_event_id) where client_event_id is not null;
create index if not exists rescue_sos_open_idx on public.rescue_sos_events(status,raised_at desc);
alter table public.rescue_sos_events enable row level security;
