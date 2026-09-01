const URL=Deno.env.get('SUPABASE_URL')!;
const BASE=URL+'/functions/v1/rescue-command-approved-ui-preview-v2';
Deno.serve(async(req:Request)=>{
  if(req.method!=='GET')return new Response('method',{status:405});
  try{
    const r=await fetch(BASE,{headers:{'cache-control':'no-cache'}});if(!r.ok)return new Response('Command email preview unavailable',{status:r.status});
    let h=await r.text();
    const patch=String.raw`
<style id="command-email-preview-style">.emailPreviewBadge{display:inline-flex;align-items:center;gap:5px;padding:4px 7px;border-radius:999px;background:#eef4ff;color:#175cd3;font-size:10px;font-weight:800}.emailPreviewPanel{margin:10px 0;padding:10px;border:1px solid #d9e2ec;border-radius:9px;background:#fff}.emailPreviewPanel code{background:#f2f4f7;padding:2px 5px;border-radius:4px}</style>
<script id="command-email-preview-js">(function(){
function addEmailPreview(){document.querySelectorAll('.approvedMember').forEach(c=>{if(c.querySelector('.emailPreviewBadge'))return;const name=c.querySelector('.approvedName');if(!name)return;const b=document.createElement('div');b.className='emailPreviewBadge';b.textContent='✉ Email reminder enabled';name.insertAdjacentElement('afterend',b)});const main=document.getElementById('approvedMain');if(main&&!document.getElementById('emailPreviewPanel')){const p=document.createElement('div');p.id='emailPreviewPanel';p.className='emailPreviewPanel';p.innerHTML='<b>Preview: Email safety reminder</b><div style="font-size:12px;margin-top:5px">Registration will collect a validated rescuer email address. Command profiles will show the email address, email-reminder preference, last reminder time, and delivery status. The 4-hour scheduler will use email only as a backup channel alongside phone/in-app alerts.</div><div style="font-size:12px;margin-top:5px">Planned fields: <code>email</code>, <code>email_notifications_enabled</code>, <code>email_verified_at</code>, <code>last_email_checkin_sent_at</code>.</div><div style="font-size:12px;margin-top:5px;color:#8a5300"><b>Preview only:</b> no outbound email is being sent and no production database columns have been added.</div>';main.prepend(p)}}
const obs=new MutationObserver(addEmailPreview);obs.observe(document.documentElement,{subtree:true,childList:true});setTimeout(addEmailPreview,300);setInterval(addEmailPreview,2000);
})();</script>`;
    h=h.replace('</body>',patch+'</body>');
    return new Response(h,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','access-control-allow-origin':'*'}})
  }catch(e){console.error(e);return new Response('Command email preview unavailable',{status:500})}
});