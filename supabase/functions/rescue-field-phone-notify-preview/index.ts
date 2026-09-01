const URL=Deno.env.get('SUPABASE_URL')!;
const BASE=URL+'/functions/v1/rescue-field-all-preview';
Deno.serve(async(req:Request)=>{
  if(req.method!=='GET')return new Response('method',{status:405});
  try{
    const r=await fetch(BASE,{headers:{'cache-control':'no-cache'}});if(!r.ok)return new Response('Rescuer notification preview unavailable',{status:r.status});
    let h=await r.text();
    h=h.replace('</head>','<link rel="manifest" href="/rescuer.webmanifest"></head>');
    const patch=String.raw`
<style id="phone-notify-preview-style">#notifyConsentWrap{margin:10px 0;padding:10px;border:1px solid #cfe3d5;border-radius:10px;background:#f7fbf8}.notifyState{font-size:12px;margin-top:6px}.notifyWarn{padding:9px;border:1px solid #ffe08a;background:#fff3cd;color:#664d03;border-radius:9px;margin-top:8px}.notifyOk{padding:9px;border:1px solid #a9dfb9;background:#e5f6eb;color:#075d37;border-radius:9px;margin-top:8px}#fourHourOverlay{position:fixed;inset:0;z-index:9200;background:#071c13de;display:none;align-items:center;justify-content:center;padding:18px}#fourHourOverlay.show{display:flex}.fourHourDialog{width:min(92vw,520px);background:#fff;border-radius:16px;padding:20px;text-align:center}.fourHourDialog h2{margin:0 0 8px;color:#8a5300}</style>
<div id="fourHourOverlay"><div class="fourHourDialog"><h2>4-Hour Check-in / ४ घण्टाको चेक-इन</h2><p>Please open/login to the Rescuer Portal and acknowledge this reminder.</p><p lang="ne">कृपया Rescuer Portal खोल्नुहोस्/लगइन गर्नुहोस् र यो सूचना स्वीकार गर्नुहोस्।</p><button id="ack4h" class="full orange">Acknowledge / स्वीकार</button><div class="small" style="margin-top:8px">While the portal is open, alert sound repeats until acknowledged. / पोर्टल खुला हुँदा स्वीकार नगरेसम्म अलर्ट ध्वनि दोहोरिन्छ।</div></div></div>
<script id="phone-notify-preview-js">(function(){
const q=id=>document.getElementById(id),FOUR=4*60*60*1000,ACK='rr_4h_ack_preview_v1';let toneTimer=null,audioCtx=null;
const terms=q('terms');if(terms)terms.checked=true;
const reg=q('reg');if(reg&&!q('notifyConsentWrap')){const w=document.createElement('div');w.id='notifyConsentWrap';w.innerHTML='<label style="display:flex;gap:8px;align-items:flex-start"><input id="notifyConsent" type="checkbox" checked style="width:auto"><span><b>Allow safety notifications on this phone / यो फोनमा सुरक्षा सूचना अनुमति दिनुहोस्</b><br><span class="small">Required for 4-hour reminders and 8-hour SAFE alerts when supported by this phone. / यो फोनले समर्थन गरेमा ४ घण्टाको रिमाइन्डर र ८ घण्टाको SAFE अलर्टका लागि आवश्यक।</span></span></label><button id="enablePhoneNotify" type="button" class="full blue">Enable Phone Notifications / फोन सूचना सक्रिय गर्नुहोस्</button><div id="notifyState" class="notifyState">Preference is pre-selected. Phone permission still requires Allow. / विकल्प पहिले नै छानिएको छ। फोनको अनुमति भने Allow थिचेर दिनुपर्छ।</div>';reg.insertBefore(w,q('register'));}
function status(t,ok=false){const s=q('notifyState');if(s){s.className=ok?'notifyState notifyOk':'notifyState notifyWarn';s.textContent=t}}
async function enableNotify(){if(!('Notification'in window)){status('This phone/browser does not support Web Notifications. / यो फोन/ब्राउजरले Web Notification समर्थन गर्दैन।');return false}if(!q('notifyConsent')?.checked){status('Notification preference is not selected.');return false}try{const p=Notification.permission==='granted'?'granted':await Notification.requestPermission();if(p!=='granted'){status('Phone notification permission was not allowed. / फोन सूचना अनुमति दिइएन।');return false}if(!('serviceWorker'in navigator)){status('Service worker is not supported on this browser.');return false}const reg=await navigator.serviceWorker.register('/rescue-sw.js',{scope:'/'});await navigator.serviceWorker.ready;status('Phone notifications enabled ✓ / फोन सूचना सक्रिय भयो ✓',true);return !!reg}catch(e){status('Phone notification setup needs the same-origin /rescue-sw.js preview route. '+(e?.message||''));return false}}
q('enablePhoneNotify')?.addEventListener('click',enableNotify);
const register=q('register');if(register)register.addEventListener('click',async()=>{if(q('notifyConsent')?.checked&&Notification?.permission!=='granted')await enableNotify()},true);
function beep(){try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.frequency.value=880;g.gain.value=.12;o.connect(g);g.connect(audioCtx.destination);o.start();setTimeout(()=>{try{o.stop()}catch{}},500)}catch{}}
function startTone(){stopTone();beep();toneTimer=setInterval(beep,3000)}function stopTone(){if(toneTimer){clearInterval(toneTimer);toneTimer=null}}
function lastAck(){return Number(localStorage.getItem(ACK)||0)}function due(){const x=lastAck();return !x||Date.now()-x>=FOUR}
function show4h(){if(!due())return;q('fourHourOverlay')?.classList.add('show');startTone();if(Notification?.permission==='granted'&&navigator.serviceWorker?.controller){navigator.serviceWorker.ready.then(r=>r.showNotification('⚠️ Rescuer Check-in — Nepal Scouts',{body:'Open Rescuer Portal and acknowledge. / Rescuer Portal खोली स्वीकार गर्नुहोस्।',tag:'rescue-4h-checkin-preview',renotify:true,requireInteraction:true,vibrate:[500,250,500,250,900],data:{url:'/rescuer',kind:'checkin'}})).catch(()=>{})}}
function ack(){localStorage.setItem(ACK,String(Date.now()));q('fourHourOverlay')?.classList.remove('show');stopTone()}
q('ack4h')?.addEventListener('click',ack);
navigator.serviceWorker?.addEventListener('message',e=>{if(e.data?.type==='rescue-notification-action'&&e.data.action==='ack')ack()});
const params=new URL(location.href).searchParams;if(params.get('notification_action')==='ack')ack();
setInterval(show4h,30000);
const how=q('previewHow');if(how){const li=document.createElement('div');li.className='notifyWarn';li.innerHTML='<b>Phone Notification / फोन सूचना:</b> 4-hour reminder requires Acknowledge / स्वीकार. The 8-hour SAFE alert still requires I AM SAFE / म सुरक्षित छु.';how.insertAdjacentElement('afterend',li)}
window.previewSimulate4h=()=>{localStorage.setItem(ACK,String(Date.now()-FOUR-1000));show4h()};
const app=q('app');if(app){const b=document.createElement('button');b.type='button';b.className='full orange';b.textContent='PREVIEW: Simulate 4-Hour Phone Alert / PREVIEW: ४ घण्टाको अलर्ट';b.onclick=window.previewSimulate4h;app.prepend(b)}
})();</script>`;
    h=h.replace('</body>',patch+'</body>');
    return new Response(h,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','access-control-allow-origin':'*'}});
  }catch(e){console.error(e);return new Response('Rescuer notification preview unavailable',{status:500})}
});
