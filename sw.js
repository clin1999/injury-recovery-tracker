// Offline support. The app's own files are cached on first visit and served from the cache straight
// away (handy with patchy signal at the gym), while a fresh copy is fetched in the background for next time.
// Bump CACHE when the file list changes. Logged data lives in localStorage, not here.
const CACHE='itb-v2';
const FILES=['./','index.html','manifest.webmanifest','src/styles.css','src/plan.js','src/dates.js','src/month.js','src/garmin.js','src/backup.js','src/app.js','icons/icon.svg','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request, url=new URL(req.url);
  if(req.method!=='GET') return;
  const own=url.origin===location.origin, fonts=/^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if(!own&&!fonts) return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const key=req.mode==='navigate'?'./':req;
    const hit=await c.match(key,{ignoreSearch:own});
    const fresh=fetch(req).then(r=>{ if(r.ok||r.type==='opaque') c.put(key,r.clone()); return r; }).catch(()=>hit);
    if(hit){ e.waitUntil(fresh); return hit; }
    return fresh;
  }));
});
