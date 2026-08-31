import { createClient } from 'npm:@supabase/supabase-js@2.102.0';

const URL = Deno.env.get('SUPABASE_URL')!;
const LIVE = URL + '/functions/v1/rescue-command-api';
const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'content-type, authorization, apikey',
  'access-control-allow-methods': 'POST,OPTIONS',
};
const J = (b: unknown, s = 200) => new Response(JSON.stringify(b), {
  status: s,
  headers: { ...cors, 'content-type': 'application/json', 'cache-control': 'no-store' },
});

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return J({ error: 'method' }, 405);

  const raw = await req.text();
  let body: any = {};
  try { body = raw ? JSON.parse(raw) : {}; } catch {}

  if (String(body.action || '') !== 'snapshot') {
    return fetch(LIVE, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': req.headers.get('authorization') || '',
      },
      body: raw,
    });
  }

  try {
    const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
    if (!token) return J({ error: 'Coordinator session required' }, 401);

    const admin = createClient(URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: authData, error: authError } = await admin.auth.getUser(token);
    if (authError || authData.user?.app_metadata?.role !== 'coordinator') {
      return J({ error: 'Coordinator session required' }, 401);
    }

    const [teamsResult, devicesResult] = await Promise.all([
      admin.from('rescue_teams')
        .select('id,name,join_code_display,checkin_minutes,leader_device_id,active,created_at')
        .order('created_at'),
      admin.from('rescue_devices')
        .select('id,team_id,rescuer_name,phone,active,mission_status,last_seen_at,last_lat,last_long,last_accuracy,battery,last_note,sos,approval_status,deployment_district,active_mission_id,joined_at,revoked_at')
        .order('joined_at'),
    ]);

    if (teamsResult.error) throw teamsResult.error;
    if (devicesResult.error) throw devicesResult.error;

    const teams = teamsResult.data || [];
    const devices = devicesResult.data || [];
    const tm = new Map(teams.map((t: any) => [t.id, t]));
    const names = new Map(devices.map((d: any) => [d.id, d.rescuer_name]));

    return J({
      ok: true,
      teams: teams.map((t: any) => ({ ...t, leader_name: names.get(t.leader_device_id) || null })),
      devices: devices.map((d: any) => ({ ...d, team_name: tm.get(d.team_id)?.name || null })),
    });
  } catch (e) {
    console.error(e);
    return J({ error: e instanceof Error ? e.message : 'Command failed' }, 500);
  }
});
