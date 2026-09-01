const URL=Deno.env.get('SUPABASE_URL')!;
const LIVE=URL+'/functions/v1/rescue-command-api';
const cors={'access-control-allow-origin':'*','access-control-allow-headers':'content-type, authorization, apikey','access-control-allow-methods':'POST,OPTIONS'};
const J=(b:unknown,s=200)=>new Response(JSON.stringify(b),{status:s,headers:{...cors,'content-type':'application/json','cache-control':'no-store'}});
const READ_ONLY=new Set(['snapshot','photos','profile','activity','gps_track']);
Deno.serve(async(req:Request)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
  if(req.method!=='POST')return J({error:'method'},405);
  const raw=await req.text();let body:any={};
  try{body=raw?JSON.parse(raw):{}}catch{}
  const action=String(body.action||'');
  if(!READ_ONLY.has(action))return J({ok:false,preview:true,error:'Preview is read-only. No production data was changed.',action},409);
  return fetch(LIVE,{method:'POST',headers:{'content-type':'application/json','authorization':req.headers.get('authorization')||''},body:raw});
});