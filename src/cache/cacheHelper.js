import crypto from 'node:crypto';
import { cacheService } from '../services/CacheService.js';
import { getSharedRedisClient, isRedisEnabled } from '../redis/redisClient.js';

// Helper unico de cache de lecturas (getOrSetCache + invalidateCache).
//
// Reglas:
// - Redis es opcional: si no esta configurado, se cae o tarda, se va directo
//   al loader (la base) sin romper nada ni mostrar errores al usuario.
// - Las claves de datos personales SIEMPRE llevan el usuario que pide
//   (buildCacheKey(resource, { userId })). La autorizacion se chequea antes
//   de llamar a getOrSetCache, nunca adentro del loader cacheado.
// - Invalidacion por etiqueta (set de claves en Redis) o por prefijo (SCAN),
//   nunca KEYS.
// - No guardar contrasenas, hashes, tokens ni datos que en la base estan
//   cifrados (chats, mensajes, reportes profesionales).

const NAMESPACE = 'cache';
const TAG_NAMESPACE = 'cache-tag';
const TAG_SET_TTL_SECONDS = 24 * 60 * 60;
const REDIS_OP_TIMEOUT_MS = 300;
const REDIS_COOLDOWN_MS = 30_000;
const REDIS_NULL_RETRY_MS = 2_000;

const inflight = new Map();
// Marca de tiempo de la ultima invalidacion por etiqueta/prefijo (en este
// proceso). Si un loader empezo ANTES de una invalidacion, su resultado no se
// guarda: evita re-cachear un dato viejo que se leyo mientras alguien escribia.
const invalidatedAt = new Map();
let globalInvalidatedAt = 0;
let redisUnavailableUntil = 0;
const defaultProvider = () => getSharedRedisClient('cache');
let redisClientProvider = defaultProvider;

function withTimeout(promise, ms) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Redis timeout (${ms}ms)`)), ms);
    }),
  ]).finally(() => clearTimeout(timer));
}

function markRedisDown(ms = REDIS_COOLDOWN_MS) {
  redisUnavailableUntil = Date.now() + ms;
}

// Un solo pedido de conexion a la vez desde este helper: el cliente compartido
// rechaza connect() concurrentes ("already connecting") y eso no es Redis caido.
let pendingClient = null;
function requestClient() {
  if (!pendingClient) {
    pendingClient = Promise.resolve()
      .then(() => redisClientProvider())
      .finally(() => { pendingClient = null; });
  }
  return pendingClient;
}

/** Devuelve el cliente Redis o null (sin Redis, caido o en enfriamiento). */
export async function getCacheRedisClient() {
  if (!isRedisEnabled() && redisClientProvider === defaultProvider) return null;
  if (Date.now() < redisUnavailableUntil) return null;
  try {
    const client = await withTimeout(requestClient(), REDIS_OP_TIMEOUT_MS * 3);
    // null = todavia conectando o no se pudo conectar: reintentar pronto.
    if (!client) markRedisDown(REDIS_NULL_RETRY_MS);
    return client || null;
  } catch {
    markRedisDown();
    return null;
  }
}

async function runRedis(operation) {
  const client = await getCacheRedisClient();
  if (!client) return { ok: false };
  try {
    return { ok: true, value: await withTimeout(operation(client), REDIS_OP_TIMEOUT_MS) };
  } catch {
    markRedisDown();
    return { ok: false };
  }
}

function fullKey(key) {
  return cacheService.buildKey(key);
}

function tagKey(tag) {
  return fullKey(`${TAG_NAMESPACE}:${tag}`);
}

function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  return `{${Object.keys(value).sort().filter((key) => value[key] !== undefined)
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

export function hashParams(params) {
  return crypto.createHash('sha1').update(stableStringify(params ?? null)).digest('hex').slice(0, 16);
}

/**
 * cache:<resource>:u:<userId>[:<hash params>]  (dato personal)
 * cache:<resource>:global[:<hash params>]     (catalogo global)
 */
export function buildCacheKey(resource, { userId = null, params = undefined } = {}) {
  const parts = [NAMESPACE, resource, userId == null ? 'global' : `u:${userId}`];
  if (params !== undefined) parts.push(hashParams(params));
  return parts.join(':');
}

export async function cacheGetJson(key) {
  const result = await runRedis((redis) => redis.get(fullKey(key)));
  if (!result.ok || result.value == null) return { hit: false };
  try {
    return { hit: true, value: JSON.parse(result.value) };
  } catch {
    return { hit: false };
  }
}

export async function cacheSetJson(key, value, ttlSeconds, tags = []) {
  const serialized = JSON.stringify(value);
  const fk = fullKey(key);
  const result = await runRedis(async (redis) => {
    const pipeline = redis.multi();
    pipeline.set(fk, serialized, 'EX', Math.max(1, Math.floor(ttlSeconds)));
    for (const tag of tags) {
      pipeline.sadd(tagKey(tag), fk);
      pipeline.expire(tagKey(tag), TAG_SET_TTL_SECONDS);
    }
    return pipeline.exec();
  });
  return result.ok;
}

function wasInvalidatedSince(startedAt, key, tags) {
  if (globalInvalidatedAt >= startedAt) return true;
  for (const tag of tags) {
    if ((invalidatedAt.get(`tag:${tag}`) ?? 0) >= startedAt) return true;
  }
  for (const [marker, at] of invalidatedAt) {
    if (at >= startedAt && marker.startsWith('prefix:') && key.startsWith(marker.slice('prefix:'.length))) return true;
    if (at >= startedAt && marker === `key:${key}`) return true;
  }
  return false;
}

/**
 * Lee `key` de Redis; si no esta, ejecuta `loader`, guarda el resultado con
 * TTL y lo devuelve. Pedidos concurrentes de la misma clave comparten un unico
 * loader (sin estampida contra la base). Cualquier problema de Redis degrada
 * en silencio a llamar al loader.
 */
export async function getOrSetCache(key, ttlSeconds, loader, { tags = [] } = {}) {
  const cached = await cacheGetJson(key);
  if (cached.hit && cached.value && Object.prototype.hasOwnProperty.call(cached.value, 'v')) {
    return cached.value.v;
  }

  if (inflight.has(key)) return inflight.get(key);

  const startedAt = Date.now();
  const promise = (async () => {
    const value = await loader();
    // null/undefined = "no hay dato" (o fallo): no se cachea.
    if (value != null && !wasInvalidatedSince(startedAt, key, tags)) {
      await cacheSetJson(key, { v: value }, ttlSeconds, tags);
    }
    return value;
  })();

  inflight.set(key, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(key);
  }
}

async function deleteByPrefix(redis, prefix) {
  let cursor = '0';
  do {
    const [next, keys] = await redis.scan(cursor, 'MATCH', `${fullKey(prefix)}*`, 'COUNT', 200);
    cursor = next;
    if (keys.length) await redis.del(...keys);
  } while (cursor !== '0');
}

/**
 * Invalida por etiqueta(s), prefijo(s) o clave(s) exacta(s). Nunca tira error:
 * si Redis no esta, no hay nada guardado que borrar (o vence solo por TTL).
 */
export async function invalidateCache({ tags = [], prefixes = [], keys = [] } = {}) {
  const now = Date.now();
  tags.forEach((tag) => invalidatedAt.set(`tag:${tag}`, now));
  prefixes.forEach((prefix) => invalidatedAt.set(`prefix:${prefix}`, now));
  keys.forEach((key) => invalidatedAt.set(`key:${key}`, now));
  // Evita que el mapa de marcas crezca sin limite: mas viejo que el TTL
  // maximo de un loader en curso ya no importa.
  if (invalidatedAt.size > 500) {
    for (const [marker, at] of invalidatedAt) if (now - at > 60_000) invalidatedAt.delete(marker);
  }

  await runRedis(async (redis) => {
    for (const tag of tags) {
      const members = await redis.smembers(tagKey(tag));
      if (members.length) await redis.del(...members);
      await redis.del(tagKey(tag));
    }
    for (const prefix of prefixes) await deleteByPrefix(redis, prefix);
    if (keys.length) await redis.del(...keys.map(fullKey));
    return true;
  });
}

export async function invalidateAllCache() {
  globalInvalidatedAt = Date.now();
  await runRedis(async (redis) => {
    await deleteByPrefix(redis, `${NAMESPACE}:`);
    await deleteByPrefix(redis, `${TAG_NAMESPACE}:`);
    return true;
  });
}

// --- Solo para tests -------------------------------------------------------
export function __setCacheRedisClientProviderForTests(provider) {
  redisClientProvider = provider ?? defaultProvider;
  redisUnavailableUntil = 0;
  pendingClient = null;
  inflight.clear();
  invalidatedAt.clear();
  globalInvalidatedAt = 0;
}
