const URL=Deno.env.get('SUPABASE_URL')!;
const BASE=URL+'/functions/v1/rescue-command-center';
const PREVIEW_API=URL+'/functions/v1/rescue-command-api-readonly-preview';
Deno.serve(async(req:Request)=>{
  if(req.method!=='GET')return new Response('method',{status:405});
  try{
    const r=await fetch(BASE,{headers:{'cache-control':'no-cache'}});
    if(!r.ok)return new Response('Command preview unavailable',{status:r.status});
    let h=await r.text();
    h=h.replaceAll(URL+'/functions/v1/rescue-command-api',PREVIEW_API);
    const patch=String.raw`
<style id="command-team-compact-preview-style">
#commandPreviewBanner{position:sticky;top:0;z-index:3500;background:#fff3cd;border:1px solid #ffe08a;color:#664d03;padding:8px 12px;text-align:center;font-weight:800}
.team.dmtCompactTeam{padding:0!important;overflow:hidden}.team.dmtCompactTeam .teamhead{display:flex!important;align-items:center!important;gap:8px!important;flex-wrap:wrap!important;padding:9px 10px!important}.dmtTeamMeta{font-size:12px;font-weight:800;color:#5e6c63;margin-left:auto}.dmtTeamControls{display:flex;gap:6px;align-items:center}.dmtMemberGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:8px}.dmtMemberGrid .member{display:grid!important;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr)!important;gap:5px 8px!important;align-items:start!important;border:1px solid #d8e5dd!important;border-radius:10px!important;padding:8px!important;margin:0!important;background:#fff!important;min-width:0}.dmtMemberGrid .member>div{min-width:0!important}.dmtMemberGrid .member>div:last-child{grid-column:1/-1!important;display:flex!important;gap:5px!important;flex-wrap:wrap!important;white-space:normal!important}.dmtMemberGrid .member button{padding:6px 8px!important;font-size:12px!important}.dmtMemberGrid .dmtIdentity{align-items:flex-start!important}.dmtTeamCollapsed .dmtMemberGrid{display:none!important}.dmtTeamCollapsed{margin-bottom:7px!important}.dmtCompactBtn{padding:6px 9px!important;font-size:12px!important;border-radius:8px!important}.dmtTeamDelete{background:#c62828!important;color:#fff!important}.dmtProfileDelete{background:#c62828!important;color:#fff!important}.dmtGlobalTeamTools{display:flex;gap:7px;flex-wrap:wrap;margin:8px 0}.dmtPreviewNote{font-size:11px;color:#7a5d00;font-weight:700}
@media(max-width:1100px){.dmtMemberGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:700px){.dmtMemberGrid{grid-template-columns:1fr}.dmtMemberGrid .member{grid-template-columns:1fr 1fr!important}.dmtTeamMeta{width:100%;margin-left:0}}
</style>
<script id="command-team-compact-preview-js">
(function(){
  const inactive=d=>d?.approval_status==='revoked'||d?.active===false;
  function previewNotice(msg){alert(msg+'\n\nPREVIEW ONLY — no production data was changed.');}
  function addGlobalTools(){
    const host=document.getElementById('teams'); if(!host||document.getElementById('dmtGlobalTeamTools'))return;
    const bar=document.createElement('div');bar.id='dmtGlobalTeamTools';bar.className='dmtGlobalTeamTools';
    bar.innerHTML='<button class="btn gray dmtCompactBtn" id="dmtCollapseAll">Minimize All Teams</button><button class="btn gray dmtCompactBtn" id="dmtExpandAll">Expand All Teams</button><span class="dmtPreviewNote">Preview is read-only</span>';
    host.before(bar);
    document.getElementById('dmtCollapseAll').onclick=()=>document.querySelectorAll('#teams .team').forEach(x=>x.classList.add('dmtTeamCollapsed'));
    document.getElementById('dmtExpandAll').onclick=()=>document.querySelectorAll('#teams .team').forEach(x=>x.classList.remove('dmtTeamCollapsed'));
  }
  function organize(){
    addGlobalTools();
    const teamEls=[...document.querySelectorAll('#teams .team')];
    teamEls.forEach((teamEl,i)=>{
      const t=data?.teams?.[i]; if(!t)return;
      if(t.active===false){teamEl.style.display='none';return;}
      teamEl.classList.add('dmtCompactTeam');
      const head=teamEl.querySelector('.teamhead');if(!head)return;
      const members=(data.devices||[]).filter(d=>d.team_id===t.id);
      const activeCount=members.filter(d=>!inactive(d)).length,totalCount=members.length;
      let meta=head.querySelector('.dmtTeamMeta');if(!meta){meta=document.createElement('span');meta.className='dmtTeamMeta';head.appendChild(meta)}
      meta.textContent=activeCount+' active • '+totalCount+' total';
      let controls=head.querySelector('.dmtTeamControls');if(!controls){controls=document.createElement('span');controls.className='dmtTeamControls';head.appendChild(controls)}
      if(!controls.querySelector('[data-collapse-team]')){
        const min=document.createElement('button');min.className='btn gray dmtCompactBtn';min.dataset.collapseTeam=t.id;min.textContent='Minimize';
        min.onclick=()=>{const collapsed=teamEl.classList.toggle('dmtTeamCollapsed');min.textContent=collapsed?'Expand':'Minimize'};controls.appendChild(min);
      }
      if(!controls.querySelector('[data-delete-team]')){
        const del=document.createElement('button');del.className='btn dmtCompactBtn dmtTeamDelete';del.dataset.deleteTeam=t.id;del.textContent='Delete Team';
        del.onclick=()=>previewNotice('Production behavior: archive this team name/code only. Rescuer, GPS, mission, photo and activity records remain preserved.');controls.appendChild(del);
      }
      let grid=teamEl.querySelector(':scope > .dmtMemberGrid');
      if(!grid){grid=document.createElement('div');grid.className='dmtMemberGrid';const direct=[...teamEl.children].filter(x=>x.classList?.contains('member'));direct.forEach(x=>grid.appendChild(x));teamEl.appendChild(grid)}
      grid.querySelectorAll('.member').forEach(row=>{
        const pb=row.querySelector('[data-profile]'),id=pb?.dataset.profile;if(!id)return;
        const actions=row.children[3]||row.lastElementChild;if(!actions)return;
        [...actions.querySelectorAll('button')].filter(b=>/hold/i.test((b.textContent||'').trim())).forEach(b=>b.style.display='none');
        if(!actions.querySelector('[data-preview-delete-profile]')){
          const d=document.createElement('button');d.className='btn dmtProfileDelete';d.dataset.previewDeleteProfile=id;d.textContent='Delete';
          d.onclick=()=>previewNotice('Production behavior: move this rescuer to Inactive. Profile, photo, GPS, missions and activity history remain preserved.');actions.appendChild(d);
        }
      });
    });
  }
  const banner=document.createElement('div');banner.id='commandPreviewBanner';banner.textContent='COMMAND PREVIEW — READ ONLY — production data cannot be changed from this page';document.body.prepend(banner);
  const timer=setInterval(()=>{try{if(typeof data!=='undefined'&&document.getElementById('teams')){organize()}}catch{}},700);
  setTimeout(()=>clearInterval(timer),60000);
  const oldRender=window.render;
  if(typeof oldRender==='function')window.render=function(){oldRender();setTimeout(organize,0)};
})();
</script>`;
    h=h.replace('</body>',patch+'</body>');
    return new Response(h,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','access-control-allow-origin':'*'}});
  }catch(e){console.error(e);return new Response('Command preview unavailable',{status:500})}
});