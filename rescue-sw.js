self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>{
  let d={};try{d=event.data?event.data.json():{}}catch{d={body:event.data?.text?.()||''}}
  const kind=d.kind||'checkin';
  const safe=kind==='safe';
  const title=d.title||(safe?'🚨 SAFE CHECK — Nepal Scouts':'⚠️ Rescuer Check-in — Nepal Scouts');
  const body=d.body||(safe?'Open Rescuer Portal and mark I AM SAFE. / Rescuer Portal खोली म सुरक्षित छु थिच्नुहोस्।':'Open Rescuer Portal and acknowledge. / Rescuer Portal खोली स्वीकार गर्नुहोस्।');
  const options={body,tag:safe?'rescue-safe-due':'rescue-4h-checkin',renotify:true,requireInteraction:true,vibrate:[500,250,500,250,900],data:{url:d.url||'/rescuer-preview',kind},actions:[{action:safe?'safe':'ack',title:safe?'I AM SAFE / म सुरक्षित छु':'Acknowledge / स्वीकार'},{action:'open',title:'Open Portal / पोर्टल खोल्नुहोस्'}]};
  event.waitUntil(self.registration.showNotification(title,options));
});
self.addEventListener('notificationclick',event=>{
  const action=event.action||'open';const data=event.notification.data||{};event.notification.close();
  const base=data.url||'/rescuer-preview';const target=base+(base.includes('?')?'&':'?')+'notification_action='+encodeURIComponent(action);
  event.waitUntil((async()=>{const wins=await clients.matchAll({type:'window',includeUncontrolled:true});for(const w of wins){if('focus'in w){await w.focus();try{w.postMessage({type:'rescue-notification-action',action,kind:data.kind||'checkin'})}catch{}return}}if(clients.openWindow)return clients.openWindow(target)})());
});