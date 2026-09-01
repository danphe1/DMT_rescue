const BASE=Deno.env.get('SUPABASE_URL')!+'/functions/v1/rescue-field-core-v25';
Deno.serve(async(req)=>{
  if(req.method!=='GET') return new Response('method',{status:405});
  try{
    const r=await fetch(BASE,{headers:{'cache-control':'no-cache'}});
    if(!r.ok) return new Response('Rescuer unavailable',{status:r.status});
    let h=await r.text();
    const patch=`
<style id="native-camera-form-hotfix">
#photoFile{display:block!important;width:100%!important;margin-top:8px!important;padding:10px!important;border:1px solid #cad7ce!important;border-radius:9px!important;background:#fff!important;pointer-events:auto!important}
#camArea{display:none!important}
#switchCam,#take,#cancelCam{display:none!important}
#auth,#reg,#reg input,#reg select,#reg textarea,#reg button{pointer-events:auto!important;touch-action:manipulation!important}
#regSubmitAlert:not(.show),#tutorialModal:not(.show){display:none!important;pointer-events:none!important}
</style>
<script id="native-camera-form-hotfix-js">
(function(){
  const q=id=>document.getElementById(id);
  const file=q('photoFile'), open=q('openCam'), choose=q('choosePhoto'), retake=q('retake');
  try{ if(window.stream&&window.stream.getTracks) window.stream.getTracks().forEach(t=>t.stop()); }catch{}
  if(file){
    file.style.display='block';
    file.removeAttribute('hidden');
    file.removeAttribute('capture');
    file.setAttribute('aria-label','Profile photo');
  }
  if(open){
    open.type='button';
    open.textContent='Take Photo with Phone Camera / फोन क्यामेराबाट फोटो खिच्नुहोस्';
    open.onclick=function(ev){
      ev.preventDefault(); ev.stopPropagation();
      if(!file) return;
      file.setAttribute('capture','environment');
      file.click();
    };
  }
  if(choose){
    choose.type='button';
    choose.textContent='Choose Photo from Phone / फोनबाट फोटो छान्नुहोस्';
    choose.onclick=function(ev){
      ev.preventDefault(); ev.stopPropagation();
      if(!file) return;
      file.removeAttribute('capture');
      file.click();
    };
  }
  if(retake){
    retake.type='button';
    retake.textContent='Choose Another Photo';
    retake.onclick=function(ev){
      ev.preventDefault(); ev.stopPropagation();
      if(!file) return;
      file.removeAttribute('capture');
      file.click();
    };
  }
  ['teamCode','name','phone','pin','address','district','blood','ecName','ecPhone'].forEach(id=>{
    const el=q(id); if(!el) return;
    el.removeAttribute('readonly'); el.removeAttribute('disabled');
    el.style.pointerEvents='auto'; el.style.touchAction='manipulation';
  });
  const auth=q('auth'); if(auth){auth.style.pointerEvents='auto'}
})();
</script>`;
    h=h.replace('</body>',patch+'</body>');
    return new Response(h,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','access-control-allow-origin':'*'}});
  }catch(e){
    console.error(e);
    return new Response('Rescuer unavailable',{status:500});
  }
});
