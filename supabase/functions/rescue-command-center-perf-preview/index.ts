const BASE = Deno.env.get('SUPABASE_URL')! + '/functions/v1/rescue-command-center';
const PREVIEW_API = Deno.env.get('SUPABASE_URL')! + '/functions/v1/rescue-command-api-perf-preview';

Deno.serve(async (req: Request) => {
  if (req.method !== 'GET') return new Response('method', { status: 405 });
  try {
    const r = await fetch(BASE, { headers: { 'cache-control': 'no-cache' } });
    if (!r.ok) return new Response('Command preview unavailable', { status: r.status });
    let html = await r.text();
    html = html.replace("PROJECT+'/functions/v1/rescue-command-api'", JSON.stringify(PREVIEW_API));
    html = html.replace(/setInterval\(\(\)=>\{if\(!\$\('app'\)\.classList\.contains\('hide'\)\)load\(\)\.catch\(\(\)=>\{\}\)\},15000\);/, "setInterval(()=>{if(!$('app').classList.contains('hide'))load().catch(()=>{})},300000);");
    return new Response(html, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store, max-age=0',
        'access-control-allow-origin': '*',
      },
    });
  } catch (e) {
    console.error(e);
    return new Response('Command preview unavailable', { status: 500 });
  }
});
