-- Consolidate duplicate rescuer profiles by normalized phone while preserving related history.
-- Survivor preference: active+approved, then active, then newest registration.
DO $$
DECLARE
  g record;
  survivor uuid;
  dup uuid;
BEGIN
  FOR g IN
    SELECT regexp_replace(phone,'\D','','g') AS phone_key
    FROM public.rescue_devices
    WHERE phone IS NOT NULL AND regexp_replace(phone,'\D','','g') <> ''
    GROUP BY 1 HAVING count(*) > 1
  LOOP
    SELECT id INTO survivor
    FROM public.rescue_devices
    WHERE regexp_replace(phone,'\D','','g') = g.phone_key
    ORDER BY (active AND approval_status='approved') DESC, active DESC, joined_at DESC
    LIMIT 1;

    -- Preserve the best available profile fields on the survivor.
    UPDATE public.rescue_devices s SET
      profile_photo_data_url = COALESCE(s.profile_photo_data_url,(SELECT d.profile_photo_data_url FROM public.rescue_devices d WHERE regexp_replace(d.phone,'\D','','g')=g.phone_key AND d.profile_photo_data_url IS NOT NULL ORDER BY d.joined_at DESC LIMIT 1)),
      address = COALESCE(s.address,(SELECT d.address FROM public.rescue_devices d WHERE regexp_replace(d.phone,'\D','','g')=g.phone_key AND nullif(d.address,'') IS NOT NULL ORDER BY d.joined_at DESC LIMIT 1)),
      blood_group = COALESCE(s.blood_group,(SELECT d.blood_group FROM public.rescue_devices d WHERE regexp_replace(d.phone,'\D','','g')=g.phone_key AND nullif(d.blood_group,'') IS NOT NULL ORDER BY d.joined_at DESC LIMIT 1)),
      emergency_contact_name = COALESCE(s.emergency_contact_name,(SELECT d.emergency_contact_name FROM public.rescue_devices d WHERE regexp_replace(d.phone,'\D','','g')=g.phone_key AND nullif(d.emergency_contact_name,'') IS NOT NULL ORDER BY d.joined_at DESC LIMIT 1)),
      emergency_contact_phone = COALESCE(s.emergency_contact_phone,(SELECT d.emergency_contact_phone FROM public.rescue_devices d WHERE regexp_replace(d.phone,'\D','','g')=g.phone_key AND nullif(d.emergency_contact_phone,'') IS NOT NULL ORDER BY d.joined_at DESC LIMIT 1)),
      deployment_district = COALESCE(s.deployment_district,(SELECT d.deployment_district FROM public.rescue_devices d WHERE regexp_replace(d.phone,'\D','','g')=g.phone_key AND d.deployment_district IS NOT NULL ORDER BY d.joined_at DESC LIMIT 1))
    WHERE s.id=survivor;

    FOR dup IN
      SELECT id FROM public.rescue_devices
      WHERE regexp_replace(phone,'\D','','g')=g.phone_key AND id<>survivor
    LOOP
      UPDATE public.rescue_teams SET leader_device_id=survivor WHERE leader_device_id=dup;
      UPDATE public.rescue_locations SET device_id=survivor WHERE device_id=dup;
      UPDATE public.rescue_messages SET device_id=survivor WHERE device_id=dup;
      UPDATE public.rescue_activity_events SET device_id=survivor WHERE device_id=dup;
      UPDATE public.rescue_device_audit SET device_id=survivor WHERE device_id=dup;
      UPDATE public.rescue_mission_reports SET device_id=survivor WHERE device_id=dup;
      UPDATE public.rescue_mission_photos SET device_id=survivor WHERE device_id=dup;
      UPDATE public.rescue_missions SET device_id=survivor WHERE device_id=dup;
      UPDATE public.rescue_push_subscriptions SET device_id=survivor WHERE device_id=dup;
      DELETE FROM public.rescue_devices WHERE id=dup;
    END LOOP;
  END LOOP;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS rescue_devices_phone_normalized_uidx
ON public.rescue_devices ((regexp_replace(phone,'\D','','g')))
WHERE phone IS NOT NULL AND regexp_replace(phone,'\D','','g') <> '';
