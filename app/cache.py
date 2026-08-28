"""
Lightweight in-process TTL cache used to serve public read-heavy endpoints
(gallery, sermons, events, card backgrounds) without hitting the database on
every request. This dramatically raises the number of concurrent read requests
an instance can serve, which is the main free-tier scaling lever.

NOTE: This is a single-process cache. Each uvicorn worker maintains its own
copy, which is fine because these endpoints are read-only and cache
invalidations are best-effort (short TTL). It is safe with multiple workers.
"""
import time
import threading


class TTLCache:
    __slots__ = ("ttl", "max_entries", "_store", "_order", "_lock")

    def __init__(self, ttl: float = 60, max_entries: int = 200):
        self.ttl = ttl
        self.max_entries = max_entries
        self._store = {}
        self._order = []
        self._lock = threading.Lock()

    def _expire(self, now):
        expired = [k for k, v in self._store.items() if now - v[1] > self.ttl]
        for k in expired:
            self._store.pop(k, None)
            if k in self._order:
                self._order.remove(k)

    def get(self, key):
        now = time.time()
        with self._lock:
            self._expire(now)
            entry = self._store.get(key)
            if entry:
                if key in self._order:
                    self._order.remove(key)
                self._order.append(key)
                return entry[0]
            return None

    def set(self, key, value):
        now = time.time()
        with self._lock:
            self._expire(now)
            self._store[key] = (value, now)
            if key in self._order:
                self._order.remove(key)
            self._order.append(key)
            while len(self._order) > self.max_entries:
                oldest = self._order.pop(0)
                self._store.pop(oldest, None)

    def invalidate(self, prefix=None):
        with self._lock:
            if prefix is None:
                self._store.clear()
                self._order.clear()
            else:
                keys = [k for k in self._store if prefix in k]
                for k in keys:
                    self._store.pop(k, None)
                    if k in self._order:
                        self._order.remove(k)


def make_ttl_cache(ttl: float = 60, max_entries: int = 200) -> TTLCache:
    return TTLCache(ttl=ttl, max_entries=max_entries)
