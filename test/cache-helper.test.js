import './helpers/test-env.js';
import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  __setCacheRedisClientProviderForTests,
  buildCacheKey,
  getOrSetCache,
  invalidateCache,
} from '../src/cache/cacheHelper.js';
import { createFakeRedis } from './helpers/fake-redis.js';

afterEach(() => __setCacheRedisClientProviderForTests(null));

function useFakeRedis() {
  const redis = createFakeRedis();
  __setCacheRedisClientProviderForTests(() => redis);
  return redis;
}

test('buildCacheKey: datos personales llevan el usuario; catalogos son globales', () => {
  assert.equal(buildCacheKey('pertenecientes', { userId: 7 }), 'cache:pertenecientes:u:7');
  assert.equal(buildCacheKey('catalog:niveles_apoyos'), 'cache:catalog:niveles_apoyos:global');
  const a = buildCacheKey('tutores', { userId: 7, params: { idUsuario: 3, x: 1 } });
  const b = buildCacheKey('tutores', { userId: 7, params: { x: 1, idUsuario: 3 } });
  const c = buildCacheKey('tutores', { userId: 8, params: { idUsuario: 3, x: 1 } });
  assert.equal(a, b, 'el orden de los parametros no cambia la clave');
  assert.notEqual(a, c, 'otro usuario => otra clave');
  assert.match(a, /^cache:tutores:u:7:[0-9a-f]{16}$/);
});

test('getOrSetCache: la segunda lectura sale de Redis sin llamar al loader', async () => {
  useFakeRedis();
  let calls = 0;
  const loader = async () => { calls += 1; return [{ id: 1 }]; };
  assert.deepEqual(await getOrSetCache('cache:x:u:1', 60, loader), [{ id: 1 }]);
  assert.deepEqual(await getOrSetCache('cache:x:u:1', 60, loader), [{ id: 1 }]);
  assert.equal(calls, 1);
});

test('getOrSetCache: el dato de un usuario nunca se devuelve a otro', async () => {
  useFakeRedis();
  await getOrSetCache(buildCacheKey('pertenecientes', { userId: 1 }), 60, async () => ['de-1']);
  const other = await getOrSetCache(buildCacheKey('pertenecientes', { userId: 2 }), 60, async () => ['de-2']);
  assert.deepEqual(other, ['de-2']);
});

test('getOrSetCache: null no se cachea (se vuelve a consultar la base)', async () => {
  useFakeRedis();
  let calls = 0;
  const loader = async () => { calls += 1; return null; };
  assert.equal(await getOrSetCache('cache:n:u:1', 60, loader), null);
  assert.equal(await getOrSetCache('cache:n:u:1', 60, loader), null);
  assert.equal(calls, 2);
});

test('getOrSetCache: pedidos concurrentes comparten un solo loader', async () => {
  useFakeRedis();
  let calls = 0;
  const loader = () => new Promise((resolve) => { calls += 1; setTimeout(() => resolve('ok'), 20); });
  const results = await Promise.all([1, 2, 3].map(() => getOrSetCache('cache:c:u:1', 60, loader)));
  assert.deepEqual(results, ['ok', 'ok', 'ok']);
  assert.equal(calls, 1);
});

test('invalidateCache por etiqueta borra todas las claves de esa etiqueta', async () => {
  useFakeRedis();
  let version = 1;
  const loader = async () => `v${version}`;
  await getOrSetCache('cache:p:u:1', 60, loader, { tags: ['pertenecientes'] });
  await getOrSetCache('cache:p:u:2', 60, loader, { tags: ['pertenecientes'] });
  await getOrSetCache('cache:otro:u:1', 60, loader, { tags: ['otro'] });
  version = 2;
  await invalidateCache({ tags: ['pertenecientes'] });
  assert.equal(await getOrSetCache('cache:p:u:1', 60, loader, { tags: ['pertenecientes'] }), 'v2');
  assert.equal(await getOrSetCache('cache:p:u:2', 60, loader, { tags: ['pertenecientes'] }), 'v2');
  assert.equal(await getOrSetCache('cache:otro:u:1', 60, loader, { tags: ['otro'] }), 'v1', 'otra etiqueta no se toca');
});

test('invalidateCache por prefijo usa SCAN (nunca KEYS) y por clave exacta', async () => {
  const redis = useFakeRedis();
  let version = 1;
  const loader = async () => `v${version}`;
  await getOrSetCache('cache:ai:u:1', 60, loader);
  await getOrSetCache('cache:ai:u:2', 60, loader);
  await getOrSetCache('cache:z:u:1', 60, loader);
  version = 2;
  await invalidateCache({ prefixes: ['cache:ai:'] });
  await invalidateCache({ keys: ['cache:z:u:1'] });
  assert.equal(await getOrSetCache('cache:ai:u:1', 60, loader), 'v2');
  assert.equal(await getOrSetCache('cache:ai:u:2', 60, loader), 'v2');
  assert.equal(await getOrSetCache('cache:z:u:1', 60, loader), 'v2');
  assert.ok(!redis.calls.some(([command]) => command === 'keys'));
});

test('un dato leido mientras alguien escribia no queda cacheado', async () => {
  useFakeRedis();
  let release;
  const slowLoader = () => new Promise((resolve) => { release = () => resolve('viejo'); });
  const pending = getOrSetCache('cache:p:u:9', 60, slowLoader, { tags: ['pertenecientes'] });
  await new Promise((resolve) => setImmediate(resolve));
  await invalidateCache({ tags: ['pertenecientes'] });
  release();
  assert.equal(await pending, 'viejo');
  assert.equal(await getOrSetCache('cache:p:u:9', 60, async () => 'nuevo', { tags: ['pertenecientes'] }), 'nuevo');
});

test('sin Redis (provider null) va directo al loader y no rompe', async () => {
  __setCacheRedisClientProviderForTests(() => null);
  let calls = 0;
  const loader = async () => { calls += 1; return 'base'; };
  assert.equal(await getOrSetCache('cache:s:u:1', 60, loader), 'base');
  assert.equal(await getOrSetCache('cache:s:u:1', 60, loader), 'base');
  assert.equal(calls, 2);
  await invalidateCache({ tags: ['x'], prefixes: ['cache:'], keys: ['cache:s:u:1'] });
});

test('Redis que tira error o se cuelga degrada en silencio al loader', async () => {
  const broken = createFakeRedis();
  broken.get = async () => { throw new Error('ECONNRESET'); };
  __setCacheRedisClientProviderForTests(() => broken);
  assert.equal(await getOrSetCache('cache:e:u:1', 60, async () => 'base'), 'base');

  const hanging = createFakeRedis();
  hanging.get = () => new Promise(() => {});
  __setCacheRedisClientProviderForTests(() => hanging);
  const started = Date.now();
  assert.equal(await getOrSetCache('cache:h:u:1', 60, async () => 'base'), 'base');
  assert.ok(Date.now() - started < 2000, 'no espera indefinidamente a Redis');

  __setCacheRedisClientProviderForTests(() => { throw new Error('sin conexion'); });
  assert.equal(await getOrSetCache('cache:t:u:1', 60, async () => 'base'), 'base');
});
