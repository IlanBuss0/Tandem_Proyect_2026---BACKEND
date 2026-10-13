// Redis en memoria con el subconjunto de comandos que usa src/cache/cacheHelper.js.
function globToRegExp(pattern) {
  return new RegExp(`^${pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`);
}

export function createFakeRedis() {
  const store = new Map();
  const sets = new Map();
  const calls = [];

  const client = {
    store,
    sets,
    calls,
    async get(key) { calls.push(['get', key]); return store.has(key) ? store.get(key) : null; },
    async set(key, value) { calls.push(['set', key]); store.set(key, value); return 'OK'; },
    async del(...keys) {
      calls.push(['del', ...keys]);
      let removed = 0;
      for (const key of keys.flat()) {
        if (store.delete(key)) removed += 1;
        if (sets.delete(key)) removed += 1;
      }
      return removed;
    },
    async sadd(key, ...members) {
      if (!sets.has(key)) sets.set(key, new Set());
      members.flat().forEach((m) => sets.get(key).add(m));
      return 1;
    },
    async smembers(key) { return [...(sets.get(key) ?? [])]; },
    async expire() { return 1; },
    async scan(cursor, _match, pattern) {
      const regex = globToRegExp(pattern);
      return ['0', [...store.keys(), ...sets.keys()].filter((key) => regex.test(key))];
    },
    multi() {
      const ops = [];
      const pipeline = {
        set: (...args) => { ops.push(() => client.set(...args)); return pipeline; },
        sadd: (...args) => { ops.push(() => client.sadd(...args)); return pipeline; },
        expire: (...args) => { ops.push(() => client.expire(...args)); return pipeline; },
        exec: async () => {
          const results = [];
          for (const op of ops) results.push([null, await op()]);
          return results;
        },
      };
      return pipeline;
    },
  };
  return client;
}
