const BASE=Deno.env.get('SUPABASE_URL')!+'/functions/v1/rescue-field-nepal-mobile-preview';
Deno.serve(async(req)=>{
  if(req.method!=='GET') return new Response('method',{status:405});
  try{
    const r=await fetch(BASE,{headers:{'cache-control':'no-cache'}});
    if(!r.ok) return new Response('Rescuer unavailable',{status:r.status});
    let h=await r.text();
    const patch=`<style id="approval-alert-30s-style">
#regSubmitAlert.show{display:flex!important;pointer-events:auto!important}
#regSubmitAlert .approvalWaitStatus{margin-top:16px;font-size:15px;font-weight:800;color:#b9f6ca}
</style>
<script id="approval-alert-30s-js">(function(){
  const q=id=>document.getElementById(id), alert=q('regSubmitAlert'), btn=q('register'), pending=q('pendingText'), app=q('app');
  if(!alert||!btn)return;
  const KEY='rr_registration_alert_started_v1';
  const MIN=30000;
  let started=Number(sessionStorage.getItem(KEY)||0), approved=false, timer=null;
  let status=alert.querySelector('.approvalWaitStatus');
  if(!status){status=document.createElement('div');status.className='approvalWaitStatus';alert.querySelector('.regAlertBox')?.appendChild(status)}
  const show=(text)=>{alert.classList.add('show'); if(status)status.textContent=text||'Waiting for Rescue Command approval… / कमाण्ड स्वीकृतिको प्रतीक्षामा…'};
  const hide=()=>{alert.classList.remove('show');sessionStorage.removeItem(KEY);started=0;approved=false;if(timer){clearTimeout(timer);timer=null}};
  const finishWhenAllowed=()=>{if(!approved||!started)return;const left=MIN-(Date.now()-started);if(left<=0)hide();else{if(timer)clearTimeout(timer);timer=setTimeout(hide,left)}};
  const sending=()=>btn.disabled&&/sending request/i.test(btn.textContent||'');
  const pendingOk=()=>/request sent|waiting for coordinator approval|waiting for command approval/i.test(pending?.textContent||'');
  const appReady=()=>app&&!app.classList.contains('hide');
  const tick=()=>{
    if(sending()){
      if(!started){started=Date.now();sessionStorage.setItem(KEY,String(started))}
      show('Sending registration to Rescue Command… / उद्धार कमाण्डमा दर्ता पठाइँदैछ…');
    } else if(pendingOk()){
      if(!started){started=Date.now();sessionStorage.setItem(KEY,String(started))}
      show('Request sent — waiting for Command approval. Keep this browser open and GPS on. / अनुरोध पठाइयो — कमाण्ड स्वीकृतिको प्रतीक्षामा। ब्राउजर खुला र GPS अन राख्नुहोस्।');
    }
    if(appReady()&&started){approved=true;show('Approved by Command ✓ / कमाण्डबाट स्वीकृत ✓');finishWhenAllowed()}
    if(started&&!sending()&&!pendingOk()&&!appReady()&&btn&&!btn.disabled){hide()}
  };
  new MutationObserver(tick).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','disabled']});
  setInterval(tick,500);
  tick();
})();</script>`;
    h=h.replace('</body>',patch+'</body>');
    return new Response(h,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','access-control-allow-origin':'*'}});
  }catch(e){return new Response('Rescuer unavailable',{status:500})}
});
