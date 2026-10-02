/* TLOU TTRPG companion — service worker. */
const CACHE = "tlou-ttrpg-v10";
const SHELL = ["./","./index.html","./data.json","./manifest.json","./icon-192.png","./icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const req=e.request, url=new URL(req.url);
  const isHTML=req.mode === "navigate" || (req.headers.get("accept")||"").includes("text/html");
  const isData=url.pathname.endsWith("data.json");
  if(isHTML||isData){
    e.respondWith(fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});return res;}).catch(()=>caches.match(req).then(r=>r||caches.match("./index.html"))));
  }else{
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});return res;})));
  }
});
