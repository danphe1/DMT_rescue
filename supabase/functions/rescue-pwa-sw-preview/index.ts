const SW=String.raw`
self.addEventListener('install',event=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>{
  let d={};try{d=event.data?event.data.json():{}}catch{d={body:event.data?.text?.()||''}}
  const safe=d.kind==='safe';
  const title=d.title||(safe?'🚨 SAFE CHECK — Nepal Scouts':'⚠️ Rescuer Check-in — Nepal Scouts');
  const body=d.body||(safe?'Open the Rescuer Portal and mark I AM SAFE. / Rescuer Portal खोली म सुरक्षित छु थिच्नुहोस्।':'Open the Rescuer Portal and acknowledge. / Rescuer Portal खोली स्वीकार गर्नुहोस्।');
  const options={body,tag:safe?'rescue-safe-due':'rescue-4h-checkin',renotify:true,requireInteraction:true,vibrate:[500,250,500,250,900],data:{url:d.url||'/rescuer',kind:d.kind||'checkin'},actions:[{action:safe?'safe':'ack',title:safe?'I AM SAFE / म सुरक्षित छु':'Acknowledge / स्वीकार'},{action:'open',title:'Open Portal / पोर्टल खोल्नुहोस्'}]};
  event.waitUntil(self.registration.showNotification(title,options));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const action=event.action||'open',data=event.notification.data||{};
  const target=(data.url||'/rescuer')+(String(data.url||'').includes('?')?'&':'?')+'notification_action='+encodeURIComponent(action);
  event.waitUntil((async()=>{const all=await clients.matchAll({type:'window',includeUncontrolled:true});for(const c of all){if('focus'in c){await c.focus();try{c.postMessage({type:'rescue-notification-action',action,kind:data.kind||'checkin'})}catch{}return}}if(clients.openWindow)return clients.openWindow(target)})());
});
`;
Deno.serve(async(req:Request)=>new Response(SW,{headers:{'content-type':'application/javascript; charset=utf-8','cache-control':'no-store','service-worker-allowed':'/functions/v1/'}}));
