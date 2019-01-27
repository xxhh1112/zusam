import http from "./http.js";

const cache = {
    // reactive data store AND cache
    data: {},
    events: {},
    register: (event, resolve) => {
        if (typeof cache.events[event] === "undefined") {
            cache.events[event] = [];
        }
        cache.events[event].push(resolve);
    },
    remove: id => {
        delete(cache.data[id]);
        window.localStorage.removeItem(id);
    },
    set: (id, data, cacheDuration = null, persistant = true) => {
        // sometimes clean cache
        if (Math.random() > 0.9) {
            cache.cleanCache();
        }
        const storageBox = {
            data: data,
            timestamp: Date.now(),
            cacheDuration: cacheDuration
        };
        if (persistant) {
            window.localStorage.setItem(id, JSON.stringify(storageBox));
        } else {
            cache.data[id] = storageBox;
        }
        return Promise.resolve(id);
    },
    handleCache: id => {
        if (!id) {
            return null;
        }
        // not persistant data has more priority
        let data = cache.data[id];
        if (!data) {
            data = window.localStorage.getItem(id);
            data = data ? JSON.parse(data) : null;
        }
        if (data) {
            let c = data.cacheDuration || 1000*60*60*24*365; // 1 year when not specified
            if (data.timestamp > Date.now() - c) {
                return data;
            }
        }
        // if it's too old, remove it and return null
        cache.remove(id);
        return null;
    },
    get: (id, nocache = false) => {
        if (!id) {
            return new Promise(r => null);
        }
        // if nocache is false, try to load from the cache
        if (!nocache) {
            let data = cache.handleCache(id);
            if (data) {
                if (data.status == "pending") {
                    // a request for the resource was made. Let's wait for it
                    return new Promise(r => cache.register(id, r));
                }
                return new Promise(r => r(data.data));
            }
        }
        // if it's an api resource, refresh it
        if (/^\/api/.test(id)) {
            let cacheDuration = 10000; // short cache by default to avoid double calls (10s)
            //if (/^\/api\/messages/.test(id)) {
            //    cacheDuration = 10 * 60 * 1000; // 10mn for a message (not likely to be changed often)
            //}
            //if (/^\/api\/(users|links|groups|me)/.test(id)) {
            //    cacheDuration = 60 * 60 * 1000; // 60mn for a user/group/link
            //}
            return cache.update(id, cacheDuration, false);
        }
        return new Promise(r => r(null));
    },
    update: (url, cacheDuration = 60*1000, persistant = false) => {
        cache.data[url] = Object.assign({status: "pending"}, cache.data[url]);
        return http.get(url).then(res => {
            cache.set(url, res, cacheDuration, persistant);
            cache.data[url] = Object.assign({status: "ready"}, cache.data[url]);
            if (Array.isArray(cache.events[url])) {
                cache.events[url].forEach(r => r.call(null, cache.data[url].data));
            }
            delete(cache.events[url]);
            return new Promise(r => r(res));
        });
    },
    cleanCache: () => {
        for (let key in window.localStorage) {
            cache.handleCache(key);
        }
    },
    resetCache: () => {
        cache.data = {};
        cache.events = {};
        window.dispatchEvent(new CustomEvent("resetCache"));
    },
    reset: () => window.localStorage.clear() && cache.resetCache(),
};
export default cache;
