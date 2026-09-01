const URL=Deno.env.get('SUPABASE_URL')!;
const BASE=URL+'/functions/v1/rescue-field-all-preview';
Deno.serve(async(req:Request)=>{
  if(req.method!=='GET')return new Response('method',{status:405});
  try{
    const r=await fetch(BASE,{headers:{'cache-control':'no-cache'}});if(!r.ok)return new Response('Rescuer email preview unavailable',{status:r.status});
    let h=await r.text();
    const patch=String.raw`
<style id="email-preview-style">#previewEmailWrap{margin:10px 0}.emailPreviewNote{font-size:12px;color:#64746a;margin-top:4px}.emailPreviewBad{border-color:#c62828!important;background:#fff7f7!important}.emailReminderPreview{margin:10px 0;padding:10px;border:1px solid #cfe3d5;border-radius:10px;background:#f7fbf8}</style>
<script id="email-preview-js">(function(){
const q=id=>document.getElementById(id), EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function install(){const reg=q('reg'),btn=q('register');if(!reg||!btn||q('previewEmailWrap'))return false;const w=document.createElement('div');w.id='previewEmailWrap';w.innerHTML='<label><b>Email Address / इमेल ठेगाना *</b></label><input id="email" type="email" inputmode="email" autocomplete="email" placeholder="rescuer@example.com" required><div class="emailPreviewNote">Used as a backup for 4-hour portal check-in reminders. / ४ घण्टाको पोर्टल चेक-इन रिमाइन्डरका लागि ब्याकअप माध्यम।</div><label style="display:flex;gap:8px;align-items:flex-start;margin-top:8px"><input id="emailNotify" type="checkbox" checked style="width:auto"><span><b>Allow 4-hour email reminders / ४ घण्टाको इमेल रिमाइन्डर अनुमति</b></span></label>';
const phone=q('phone');if(phone?.parentElement)phone.parentElement.insertAdjacentElement('afterend',w);else reg.insertBefore(w,btn);
const old=btn.onclick;btn.onclick=async function(e){const email=(q('email')?.value||'').trim().toLowerCase();const el=q('email');if(!EMAIL.test(email)){e?.preventDefault();e?.stopPropagation();el?.classList.add('emailPreviewBad');el?.setCustomValidity('Enter a valid email address.');el?.reportValidity();el?.scrollIntoView({behavior:'smooth',block:'center'});return false}el?.classList.remove('emailPreviewBad');el?.setCustomValidity('');localStorage.setItem('rr_preview_email_v1',email);localStorage.setItem('rr_preview_email_notify_v1',q('emailNotify')?.checked?'1':'0');return old?.call(this,e)};
const note=document.createElement('div');note.className='emailReminderPreview';note.innerHTML='<b>Email reminder preview</b><br>Every 4 hours, the rescuer would receive an email asking them to open the portal and acknowledge the check-in. Actual outbound email is disabled in preview until an email provider is configured.';reg.insertBefore(note,btn);return true}
let n=0;const t=setInterval(()=>{if(install()||++n>30)clearInterval(t)},200);install();
})();</script>`;
    h=h.replace('</body>',patch+'</body>');
    return new Response(h,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','access-control-allow-origin':'*'}})
  }catch(e){console.error(e);return new Response('Rescuer email preview unavailable',{status:500})}
});