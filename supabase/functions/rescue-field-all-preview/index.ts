const URL=Deno.env.get('SUPABASE_URL')!
const BASE=URL+'/functions/v1/rescue-field'
const REG_PREVIEW=URL+'/functions/v1/rescue-registration-all-preview'
Deno.serve(async(req:Request)=>{
  if(req.method!=='GET')return new Response('method',{status:405})
  try{
    const r=await fetch(BASE,{headers:{'cache-control':'no-cache'}})
    if(!r.ok)return new Response('Rescuer preview unavailable',{status:r.status})
    let h=await r.text()
    h=h.replaceAll(URL+'/functions/v1/rescue-registration-api',REG_PREVIEW)
    const patch=String.raw`
<style id="all-approved-preview-style">
#allPreviewBanner{position:sticky;top:0;z-index:5000;background:#fff3cd;border:1px solid #ffe08a;color:#664d03;padding:8px 12px;text-align:center;font-weight:900;font-size:13px}
.previewHow{background:#f7fbf8;border:1px solid #cfe3d5;border-radius:12px;padding:10px;margin:10px 0}.previewHow summary{cursor:pointer;font-weight:900;color:#075d37}.previewHow ol{margin:8px 0 0;padding-left:22px}.previewHow li{margin:5px 0;line-height:1.35}.previewPhoneRule{font-size:12px;color:#64746a;margin-top:4px}.previewBad{border-color:#c62828!important;background:#fff7f7!important}
#previewApprovalOverlay,#previewSafeOverlay{position:fixed;inset:0;z-index:9000;background:#071c13d9;display:none;align-items:center;justify-content:center;padding:18px}#previewApprovalOverlay.show,#previewSafeOverlay.show{display:flex}.previewDialog{width:min(92vw,520px);background:#fff;border-radius:16px;padding:20px;box-shadow:0 18px 60px #0007;text-align:center}.previewDialog h2{margin:0 0 8px;color:#075d37}.previewSpinner{width:42px;height:42px;border:5px solid #dce8e0;border-top-color:#078346;border-radius:50%;margin:12px auto;animation:previewSpin .8s linear infinite}@keyframes previewSpin{to{transform:rotate(360deg)}}
#previewSafeCard{border:2px solid #1565c0;background:#eef5ff}.previewSafeStatus{font-weight:900;font-size:16px;margin:6px 0}.previewSafeStatus.due{color:#b26a00}.previewSafeStatus.ok{color:#087443}.previewSafeTest{margin-top:8px;font-size:12px}.previewOperationalNote{background:#fff8e1;border:1px solid #ffe082;border-radius:9px;padding:9px;margin:8px 0;font-size:12px}
</style>
<div id="previewApprovalOverlay"><div class="previewDialog"><div class="previewSpinner" id="previewApprovalSpinner"></div><h2 id="previewApprovalTitle">Verifying Team Code…</h2><div id="previewApprovalText">Please wait / कृपया प्रतीक्षा गर्नुहोस्</div></div></div>
<div id="previewSafeOverlay"><div class="previewDialog"><h2>Safety Check Due / सुरक्षा पुष्टि आवश्यक</h2><p>Please open/login to the Rescuer Portal and confirm that you are safe.</p><p lang="ne">कृपया Rescuer Portal खोल्नुहोस्/लगइन गर्नुहोस् र आफू सुरक्षित रहेको पुष्टि गर्नुहोस्।</p><button id="previewSafeConfirmOverlay" class="full blue">✓ I AM SAFE / म सुरक्षित छु</button><div class="small" style="margin-top:8px">This warning remains until SAFE is confirmed. / SAFE पुष्टि नभएसम्म यो सूचना देखिरहन्छ।</div></div></div>
<script id="all-approved-preview-js">
(function(){
  const REG='${REG_PREVIEW}',SAFE_KEY='rr_safe_preview_last_v1',EIGHT=8*60*60*1000;
  const q=id=>document.getElementById(id), mobile=/^(96|97|98)\d{8}$/;
  const banner=document.createElement('div');banner.id='allPreviewBanner';banner.textContent='RESCUER PREVIEW — NO REGISTRATION OR OPERATIONAL DATA WILL BE WRITTEN TO PRODUCTION';document.body.prepend(banner);
  const auth=q('auth');
  if(auth&&!q('previewHow')){
    const d=document.createElement('details');d.id='previewHow';d.className='previewHow';d.open=true;d.innerHTML='<summary>How to Use / कसरी प्रयोग गर्ने</summary><ol><li><b>Enter Team Code / टिम कोड राख्नुहोस्</b></li><li><b>Fill Your Details / आफ्नो विवरण भर्नुहोस्</b></li><li><b>Take or Choose Profile Photo / प्रोफाइल फोटो खिच्नुहोस् वा छान्नुहोस्</b></li><li><b>Allow Location Access / लोकेसन अनुमति दिनुहोस्</b></li><li><b>Submit Registration / दर्ता पेश गर्नुहोस्</b></li><li><b>Valid Team Code = Automatic Approval / सही टिम कोड = स्वतः स्वीकृति</b></li><li><b>Keep GPS On During Mission / मिसनमा GPS अन राख्नुहोस्</b></li><li><b>Every 8 Hours Confirm SAFE / प्रत्येक ८ घण्टामा SAFE पुष्टि गर्नुहोस्</b></li><li><b>Use SOS Only in Emergency / आपतकालमा मात्र SOS प्रयोग गर्नुहोस्</b></li></ol>';
    const tabs=auth.querySelector('.tabs');tabs?.insertAdjacentElement('afterend',d);
  }
  function setupPhone(id,label){const el=q(id);if(!el)return;el.setAttribute('inputmode','numeric');el.setAttribute('maxlength','10');el.setAttribute('minlength','10');el.setAttribute('pattern','(96|97|98)[0-9]{8}');el.setAttribute('autocomplete','tel-national');el.setAttribute('placeholder','98XXXXXXXX');const help=document.createElement('div');help.className='previewPhoneRule';help.textContent='10-digit Nepal mobile only: starts with 96, 97, or 98. / १० अङ्कको नेपाली मोबाइल: 96, 97 वा 98 बाट सुरु हुनुपर्छ।';el.insertAdjacentElement('afterend',help);const clean=()=>{el.value=(el.value||'').replace(/\D/g,'').slice(0,10);const bad=!!el.value&&!mobile.test(el.value);el.classList.toggle('previewBad',bad);el.setCustomValidity(bad?label+' must be a valid 10-digit Nepal mobile number starting with 96, 97, or 98.':'')};el.addEventListener('input',clean);el.addEventListener('blur',clean);clean()}
  setupPhone('phone','Mobile number');setupPhone('ecPhone','Emergency contact');
  const loginPhone=q('loginPhone');if(loginPhone){const note=document.createElement('div');note.className='previewOperationalNote';note.textContent='Preview login is disabled to prevent operational changes to live rescuer accounts. / लाइभ रेस्क्युअर खातामा असर नपरोस् भनेर Preview login बन्द गरिएको छ।';loginPhone.closest('#login')?.prepend(note)}
  const loginBtn=q('loginBtn');if(loginBtn){loginBtn.onclick=e=>{e.preventDefault();alert('Preview login is disabled. No live account was changed. / Preview login बन्द छ। लाइभ खातामा कुनै परिवर्तन गरिएको छैन।')}}
  function approval(show,title,text,done=false){const o=q('previewApprovalOverlay');if(!o)return;o.classList.toggle('show',show);q('previewApprovalTitle').textContent=title||'';q('previewApprovalText').textContent=text||'';const s=q('previewApprovalSpinner');if(s)s.style.display=done?'none':'block'}
  function photoData(){const p=q('preview');return p&&/^data:image\//i.test(p.src||'')?p.src:null}
  function locationCheck(){return new Promise((resolve,reject)=>{if(!navigator.geolocation)return reject(new Error('Location is not available on this browser.'));navigator.geolocation.getCurrentPosition(()=>resolve(true),e=>reject(new Error('Location permission is required. '+(e.message||''))),{enableHighAccuracy:false,timeout:10000,maximumAge:60000})})}
  function showDemo(team){['auth','pending','locked'].forEach(id=>q(id)?.classList.add('hide'));q('app')?.classList.remove('hide');if(q('teamName'))q('teamName').textContent=team?.name||'Preview Team';if(q('state')){q('state').textContent='PREVIEW — AUTO APPROVED';q('state').className='state active'};const operational=['start','returning','sos','end','update','sendCommand','saveDistrict'];operational.forEach(id=>{const b=q(id);if(b){b.disabled=true;b.title='Preview only — production write blocked'}});if(q('gps'))q('gps').textContent='GPS: Preview mode — no location is being uploaded';if(q('queueState'))q('queueState').textContent='GPS queue: Preview only';installSafeCard();checkSafe()}
  async function previewRegister(ev){ev?.preventDefault();ev?.stopPropagation();const b=q('register');if(!b||b.disabled)return;try{
    const vals={team:q('teamCode')?.value.trim(),name:q('name')?.value.trim(),phone:q('phone')?.value.trim(),pin:q('pin')?.value.trim(),address:q('address')?.value.trim(),district:q('district')?.value,blood:q('blood')?.value,ecName:q('ecName')?.value.trim(),ecPhone:q('ecPhone')?.value.trim()};
    if(!vals.team||!vals.name||!vals.phone||!vals.pin||!vals.address||!vals.district||!vals.blood||!vals.ecName||!vals.ecPhone)throw new Error('Please complete every required field. / कृपया सबै आवश्यक विवरण भर्नुहोस्।');
    if(!mobile.test(vals.phone)||!mobile.test(vals.ecPhone))throw new Error('Use valid 10-digit Nepal mobile numbers starting with 96, 97, or 98.');
    const photo=photoData();if(!photo)throw new Error('Profile photo is required. / प्रोफाइल फोटो आवश्यक छ।');if(!q('terms')?.checked)throw new Error('Location tracking consent is required. / लोकेसन ट्र्याकिङ सहमति आवश्यक छ।');
    approval(true,'Verifying Team Code… / टिम कोड जाँच हुँदैछ','Checking registration safely in preview. / Preview मा सुरक्षित रूपमा जाँच हुँदैछ।');b.disabled=true;await locationCheck();
    const resp=await fetch(REG,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({team_code:vals.team,name:vals.name,phone:vals.phone,pin:vals.pin,address:vals.address,deployment_district:vals.district,blood_group:vals.blood,emergency_contact_name:vals.ecName,emergency_contact_phone:vals.ecPhone,profile_photo_data_url:photo,device_label:navigator.userAgent.slice(0,100),tracking_terms_accepted:true,location_permission_confirmed:true})});
    const d=await resp.json().catch(()=>({}));if(!resp.ok||!d.ok)throw new Error(d.error||'Preview registration failed.');
    approval(true,'Approved Automatically ✓ / स्वतः स्वीकृत ✓','Team code verified. PREVIEW ONLY — no rescuer record was created. / टिम कोड प्रमाणित भयो। Preview मात्र — कुनै लाइभ रेकर्ड बनाइएको छैन।',true);
    localStorage.setItem(SAFE_KEY,String(Date.now()));setTimeout(()=>{approval(false,'','');showDemo(d.team)},7000);
  }catch(e){approval(false,'','');alert((e&&e.message)||'Preview registration failed');b.disabled=false}}
  const register=q('register');if(register){register.onclick=previewRegister;register.textContent='Preview Registration / दर्ता Preview'}
  function lastSafe(){return Number(localStorage.getItem(SAFE_KEY)||0)}
  function safeDue(){const x=lastSafe();return !x||Date.now()-x>=EIGHT}
  function fmtTime(ms){if(!ms)return 'Not confirmed yet / अझै पुष्टि भएको छैन';try{return new Date(ms).toLocaleString()}catch{return String(ms)}}
  function installSafeCard(){if(q('previewSafeCard'))return;const app=q('app');if(!app)return;const card=document.createElement('div');card.id='previewSafeCard';card.className='card';card.innerHTML='<h3 style="margin-top:0">8-Hour SAFE Check / ८ घण्टाको SAFE पुष्टि</h3><div id="previewSafeStatus" class="previewSafeStatus">Checking…</div><div class="small">Every 8 hours from the last SAFE confirmation, the warning stays visible until the rescuer confirms SAFE. This resets only the safety timer; it does not end the mission or stop GPS.<br><span lang="ne">अन्तिम SAFE पुष्टि भएको ८ घण्टापछि सूचना देखिन्छ र SAFE पुष्टि नगरेसम्म हट्दैन। यसले सुरक्षा टाइमर मात्र रिसेट गर्छ; मिसन अन्त्य गर्दैन र GPS बन्द गर्दैन।</span></div><button id="previewSafeConfirm" class="full blue">✓ I AM SAFE / म सुरक्षित छु</button><button id="previewSafeDueNow" class="full orange previewSafeTest">PREVIEW: Simulate 8 Hours Due / PREVIEW: ८ घण्टा पुगेको देखाउनुहोस्</button>';app.prepend(card);q('previewSafeConfirm').onclick=confirmSafe;q('previewSafeDueNow').onclick=()=>{localStorage.setItem(SAFE_KEY,String(Date.now()-EIGHT-1000));checkSafe()};q('previewSafeConfirmOverlay').onclick=confirmSafe}
  function confirmSafe(){localStorage.setItem(SAFE_KEY,String(Date.now()));q('previewSafeOverlay')?.classList.remove('show');checkSafe()}
  function checkSafe(){const s=q('previewSafeStatus');if(!s)return;const due=safeDue();s.className='previewSafeStatus '+(due?'due':'ok');s.textContent=due?'SAFE DUE — confirm now / SAFE पुष्टि आवश्यक':'SAFE confirmed • '+fmtTime(lastSafe())+' / SAFE पुष्टि भयो';q('previewSafeOverlay')?.classList.toggle('show',due)}
  setInterval(()=>{if(q('previewSafeCard'))checkSafe()},30000);
})();
</script>`
    h=h.replace('</body>',patch+'</body>')
    return new Response(h,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','access-control-allow-origin':'*'}})
  }catch(e){console.error(e);return new Response('Rescuer preview unavailable',{status:500})}
})
