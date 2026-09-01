import { createClient } from 'npm:@supabase/supabase-js@2.102.0'
const URL=Deno.env.get('SUPABASE_URL')!
const admin=createClient(URL,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}})
const cors={'access-control-allow-origin':'*','access-control-allow-headers':'content-type, apikey, authorization','access-control-allow-methods':'POST,OPTIONS','content-type':'application/json','cache-control':'no-store'}
const J=(b:any,s=200)=>new Response(JSON.stringify(b),{status:s,headers:cors})
const enc=new TextEncoder()
async function sha(s:string){const d=await crypto.subtle.digest('SHA-256',enc.encode(s));return [...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,'0')).join('')}
const phone=(v:any)=>String(v||'').replace(/\D/g,'')
const validMobile=(v:any)=>/^(96|97|98)\d{8}$/.test(phone(v))
const validPhoto=(v:any)=>{const s=String(v||'');return s.startsWith('data:image/')&&s.length>100&&s.length<700000}
const letters=(v:string)=>/^[\p{L}\s]+$/u.test(v)
Deno.serve(async(req:Request)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors})
  if(req.method!=='POST')return J({ok:false,error:'method'},405)
  try{
    const b=await req.json()
    const code=String(b.team_code||'').trim(),name=String(b.name||'').trim(),pin=String(b.pin||'').trim(),address=String(b.address||'').trim(),district=String(b.deployment_district||'').trim(),blood=String(b.blood_group||'').trim(),ecName=String(b.emergency_contact_name||'').trim()
    if(!code||!name||!b.phone||!pin||!address||!district||!blood||!ecName||!b.emergency_contact_phone||!validPhoto(b.profile_photo_data_url))return J({ok:false,preview:true,error:'All registration fields, including profile photo, are required.'},400)
    if(name.length<2)return J({ok:false,preview:true,error:'Enter your full name.'},400)
    if(!validMobile(b.phone))return J({ok:false,preview:true,error:'Enter a valid 10-digit Nepal mobile number starting with 96, 97, or 98.'},400)
    if(!validMobile(b.emergency_contact_phone))return J({ok:false,preview:true,error:'Emergency contact must be a valid 10-digit Nepal mobile number starting with 96, 97, or 98.'},400)
    if(pin.length<4)return J({ok:false,preview:true,error:'Rescuer code must be at least 4 digits.'},400)
    if(!letters(ecName))return J({ok:false,preview:true,error:'Emergency contact name can contain letters and spaces only.'},400)
    if(b.tracking_terms_accepted!==true||b.location_permission_confirmed!==true)return J({ok:false,preview:true,error:'Location tracking consent and location permission are required.'},400)
    const h=await sha(code)
    const {data:team,error}=await admin.from('rescue_teams').select('id,name,checkin_minutes,active').eq('join_code_hash',h).eq('active',true).maybeSingle()
    if(error)throw error
    if(!team)return J({ok:false,preview:true,error:'Invalid or inactive team code.'},403)
    return J({ok:true,preview:true,simulated:true,pending:false,approval_status:'approved',device_id:'preview-'+crypto.randomUUID(),device_token:'preview-only',team:{id:team.id,name:team.name,checkin_minutes:team.checkin_minutes},message:'Team code verified — registration approved automatically. PREVIEW ONLY: no rescuer record was created.'})
  }catch(e){console.error(e);return J({ok:false,preview:true,error:e instanceof Error?e.message:'Preview registration failed'},500)}
})
