!function(){function e(e){return new Promise((function(t,n){e.oncomplete=e.onsuccess=function(){return t(e.result)},e.onabort=e.onerror=function(){return n(e.error)}}))}function t(t,n){var r=indexedDB.open(t);r.onupgradeneeded=function(){return r.result.createObjectStore(n)};var u=e(r);return function(e,t){return u.then((function(r){return t(r.transaction(n,e).objectStore(n))}))}}var n;function r(){return n||(n=t("keyval-store","keyval")),n}function u(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:r();return n("readonly",(function(n){return e(n.get(t))}))}function o(t,n){var u=arguments.length>2&&void 0!==arguments[2]?arguments[2]:r();return u("readwrite",(function(r){return r.put(n,t),e(r.transaction)}))}const a="zusam-0.5.1",c=t(a,a),i=[{route:new RegExp("/api/images/crop/"),duration:31536e6},{route:new RegExp("/api/images/thumbnail/"),duration:31536e6}];function s(e,t,n){return o(t.url,{lastUsedAt:Date.now(),updatedAt:Date.now()},c).then((()=>e.put(t,n)))}function d(e){return caches.open(a).then((t=>fetch(e).then((n=>s(t,e,n)))))}self.addEventListener("fetch",(e=>{var t;"GET"==e.request.method&&i.some((t=>e.request.url.match(t.route)))&&(e.respondWith((t=e.request,caches.open(a).then((e=>e.match(t).then((e=>e?o(t.url,{lastUsedAt:Date.now()},c).then((()=>e)):function(e,t){return fetch(e).then((n=>{if(t){let t=n.clone();caches.open(a).then((n=>s(n,e,t)))}return n}))}(t,!0))))))),e.waitUntil((()=>{u(e.request.url,c).then((t=>{if(t&&Object.protoype.hasOwnProperty.call(t,"updatedAt")&&null!=t.updatedAt){t.updatedAt+i.find((t=>e.request.url.match(t.route))).duration<Date.now()&&d(e.request)}})).catch((()=>d(e.request)))})))}))}();
//# sourceMappingURL=service-workers.js.map
