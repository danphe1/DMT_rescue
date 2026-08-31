const FIELD = Deno.env.get('SUPABASE_URL')! + '/functions/v1/rescue-field';

Deno.serve(async (req: Request) => {
  if (req.method !== 'GET') return new Response('method', { status: 405 });
  try {
    const r = await fetch(FIELD, { headers: { 'cache-control': 'no-cache' } });
    const html = await r.text();
    if (!r.ok) return new Response('Rescuer portal unavailable', { status: r.status });
    return new Response(html, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store, max-age=0',
        'access-control-allow-origin': '*',
      },
    });
  } catch (e) {
    console.error(e);
    return new Response('Rescuer portal unavailable', { status: 500 });
  }
});
