alter table public.rescue_devices add column if not exists last_gps_at timestamptz;
update public.rescue_devices d
set last_gps_at = x.max_recorded_at
from (
  select device_id, max(recorded_at) as max_recorded_at
  from public.rescue_locations
  group by device_id
) x
where d.id=x.device_id and (d.last_gps_at is null or d.last_gps_at < x.max_recorded_at);
