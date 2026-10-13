import { cacheGetJson, cacheSetJson, getCacheRedisClient, invalidateCache } from './cacheHelper.js';

// Cache de la validacion de cuenta que hace authMiddleware en cada pedido.
// - Redis: 60 s (clave auth:account:<id>).
// - Sin Redis (o Redis caido): memoria del proceso, 10 s como maximo.
// Solo se guardan los campos que usa el middleware / expone req.account
// (los de AuthRepository.findSafeById): nunca hash de contrasena ni tokens.

export const ACCOUNT_CACHE_TTL_SECONDS = 60;
export const ACCOUNT_MEMORY_TTL_MS = 10_000;

const SAFE_ACCOUNT_FIELDS = [
  'id', 'id_tipo_usuario', 'nombre_usuario', 'nombre', 'apellido', 'correo',
  'telefono', 'fecha_nacimiento', 'fecha_ingreso', 'activo', 'email_verificado',
];

const memory = new Map();

export function accountCacheKey(idUsuario) {
  return `auth:account:${idUsuario}`;
}

export function pickSafeAccount(account) {
  if (!account) return null;
  const safe = {};
  for (const field of SAFE_ACCOUNT_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(account, field)) safe[field] = account[field];
  }
  return safe;
}

function readMemory(idUsuario) {
  const entry = memory.get(String(idUsuario));
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    memory.delete(String(idUsuario));
    return undefined;
  }
  return entry.value;
}

function writeMemory(idUsuario, value) {
  if (memory.size > 5000) memory.clear();
  memory.set(String(idUsuario), { value, expiresAt: Date.now() + ACCOUNT_MEMORY_TTL_MS });
}

/**
 * Devuelve la cuenta segura de `idUsuario` desde cache o, si no esta, desde
 * `loader` (la base). Si el cache falla se usa la base: nunca rompe el login.
 */
export async function getCachedAccount(idUsuario, loader) {
  const key = accountCacheKey(idUsuario);
  const redisAvailable = Boolean(await getCacheRedisClient());

  if (redisAvailable) {
    const cached = await cacheGetJson(key);
    if (cached.hit && cached.value && typeof cached.value === 'object') return cached.value;
  } else {
    const fromMemory = readMemory(idUsuario);
    if (fromMemory !== undefined) return fromMemory;
  }

  const account = pickSafeAccount(await loader());
  // No se cachea "no existe": un id inexistente no debe ocupar cache y una
  // cuenta recien creada tiene que verse enseguida.
  if (!account) return null;

  const stored = redisAvailable && await cacheSetJson(key, account, ACCOUNT_CACHE_TTL_SECONDS);
  if (!stored) writeMemory(idUsuario, account);
  return account;
}

/**
 * Borra la cuenta cacheada (Redis + memoria). Llamar siempre que cambie algo
 * de la cuenta: logout, contrasena, email, verificacion, activo, rol, borrado.
 * Tambien invalida el contexto de autorizacion cacheado de ese usuario.
 */
export async function invalidateAccountCache(idUsuario) {
  if (idUsuario == null) return;
  memory.delete(String(idUsuario));
  await invalidateCache({
    keys: [accountCacheKey(idUsuario), `cache:authz-usercontext:u:${idUsuario}`],
  });
}

export function __clearAccountMemoryCacheForTests() {
  memory.clear();
}
