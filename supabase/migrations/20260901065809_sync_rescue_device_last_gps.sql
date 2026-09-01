create or replace function public.sync_rescue_device_last_gps()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  update public.rescue_devices
  set last_gps_at = greatest(coalesce(last_gps_at, new.recorded_at), new.recorded_at),
      last_lat = case when last_gps_at is null or new.recorded_at >= last_gps_at then new.latitude else last_lat end,
      last_long = case when last_gps_at is null or new.recorded_at >= last_gps_at then new.longitude else last_long end,
      last_accuracy = case when last_gps_at is null or new.recorded_at >= last_gps_at then new.accuracy else last_accuracy end,
      battery = case when (last_gps_at is null or new.recorded_at >= last_gps_at) and new.battery is not null then new.battery else battery end,
      updated_at = now()
  where id = new.device_id;
  return new;
end;
$$;
revoke all on function public.sync_rescue_device_last_gps() from public;
drop trigger if exists rescue_locations_sync_device_last_gps on public.rescue_locations;
create trigger rescue_locations_sync_device_last_gps
after insert on public.rescue_locations
for each row execute function public.sync_rescue_device_last_gps();
