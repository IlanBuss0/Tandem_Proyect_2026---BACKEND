import './helpers/test-env.js';
import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import AuthRepository from '../src/repositories/AuthRepository.js';
import AuthService from '../src/services/AuthService.js';
import RefreshTokenRepository from '../src/repositories/RefreshTokenRepository.js';
import { authMiddleware } from '../src/middlewares/auth.middleware.js';
import { ACCESS_COOKIE_NAME } from '../src/configs/auth-cookies.config.js';
import { signJwt as realSignJwt } from '../src/modules/security/jwt.helper.js';
const signJwt = payload => realSignJwt({ ...payload, sid: 'test-session' });
RefreshTokenRepository.isFamilyActive = async (_id, sid) => sid === 'test-session';
import { __setCacheRedisClientProviderForTests } from '../src/cache/cacheHelper.js';
import {
  ACCOUNT_MEMORY_TTL_MS,
  __clearAccountMemoryCacheForTests,
  accountCacheKey,
  getCachedAccount,
  invalidateAccountCache,
} from '../src/cache/accountCache.js';
import { createFakeRedis } from './helpers/fake-redis.js';

const originalFind = AuthRepository.findSafeById;
afterEach(() => {
  AuthRepository.findSafeById = originalFind;
  __setCacheRedisClientProviderForTests(null);
  __clearAccountMemoryCacheForTests();
});

function runMiddleware(id, req = {}) {
  const request = { cookies: { [ACCESS_COOKIE_NAME]: signJwt({ id }) }, ...req };
  return new Promise((resolve) => authMiddleware(request, {}, (error) => resolve({ error, request })));
}

function countingRepository(account) {
  const state = { calls: 0, account };
  AuthRepository.findSafeById = async () => { state.calls += 1; return state.account; };
  return state;
}

test('con Redis: la cuenta se consulta una vez y despues sale del cache', async () => {
  const redis = createFakeRedis();
  __setCacheRedisClientProviderForTests(() => redis);
  const repo = countingRepository({ id: 5, activo: true, email_verificado: true, id_tipo_usuario: 2 });

  for (let i = 0; i < 3; i += 1) {
    const { error, request } = await runMiddleware(5);
    assert.equal(error, undefined);
    assert.equal(request.account.id, 5);
  }
  assert.equal(repo.calls, 1);
  assert.ok(redis.store.has(`tandem:${accountCacheKey(5)}`));
});

test('nunca se guarda el hash de la contrasena ni campos fuera de la lista segura', async () => {
  const redis = createFakeRedis();
  __setCacheRedisClientProviderForTests(() => redis);
  const account = await getCachedAccount(6, async () => ({
    id: 6, activo: true, email_verificado: true, contrasena_hash: 'argon2$secreto', token: 'x',
  }));
  assert.equal(account.contrasena_hash, undefined);
  const stored = redis.store.get(`tandem:${accountCacheKey(6)}`);
  assert.ok(!stored.includes('secreto'));
  assert.ok(!stored.includes('token'));
});

test('cuenta desactivada: al invalidar, el siguiente pedido ya no entra por cache', async () => {
  const redis = createFakeRedis();
  __setCacheRedisClientProviderForTests(() => redis);
  const repo = countingRepository({ id: 7, activo: true, email_verificado: true });
  assert.equal((await runMiddleware(7)).error, undefined);

  repo.account = { id: 7, activo: false, email_verificado: true };
  await invalidateAccountCache(7);
  const { error } = await runMiddleware(7);
  assert.equal(error?.statusCode, 401);
});

test('logout invalida la cuenta cacheada del usuario de ese refresh token', async () => {
  const redis = createFakeRedis();
  __setCacheRedisClientProviderForTests(() => redis);
  countingRepository({ id: 8, activo: true, email_verificado: true });
  await runMiddleware(8);
  assert.ok(redis.store.has(`tandem:${accountCacheKey(8)}`));

  const originalFindToken = RefreshTokenRepository.findByTokenHash;
  const originalRevoke = RefreshTokenRepository.revoke;
  RefreshTokenRepository.findByTokenHash = async () => ({ id_usuario: 8 });
  RefreshTokenRepository.revoke = async () => 1;
  try {
    assert.deepEqual(await AuthService.logout('refresh-token'), { revoked: true });
  } finally {
    RefreshTokenRepository.findByTokenHash = originalFindToken;
    RefreshTokenRepository.revoke = originalRevoke;
  }
  assert.ok(!redis.store.has(`tandem:${accountCacheKey(8)}`));
});

test('sin Redis: cache en memoria de 10 s como maximo y se puede invalidar', async () => {
  __setCacheRedisClientProviderForTests(() => null);
  assert.ok(ACCOUNT_MEMORY_TTL_MS <= 10_000);
  const repo = countingRepository({ id: 9, activo: true, email_verificado: true });
  await runMiddleware(9);
  await runMiddleware(9);
  assert.equal(repo.calls, 1);
  await invalidateAccountCache(9);
  await runMiddleware(9);
  assert.equal(repo.calls, 2);
});

test('si Redis falla, el login sigue funcionando contra la base', async () => {
  const broken = createFakeRedis();
  broken.get = async () => { throw new Error('down'); };
  __setCacheRedisClientProviderForTests(() => broken);
  countingRepository({ id: 10, activo: true, email_verificado: true });
  const { error, request } = await runMiddleware(10);
  assert.equal(error, undefined);
  assert.equal(request.account.id, 10);
});

test('authMiddleware montado dos veces en el mismo pedido no repite la consulta', async () => {
  __setCacheRedisClientProviderForTests(() => null);
  const repo = countingRepository({ id: 11, activo: true, email_verificado: true });
  const { request } = await runMiddleware(11);
  __clearAccountMemoryCacheForTests();
  await new Promise((resolve) => authMiddleware(request, {}, resolve));
  assert.equal(repo.calls, 1);
});

test('/me devuelve la cuenta que ya cargo el middleware', async () => {
  countingRepository(null);
  const account = { id: 12, nombre: 'Ana', activo: true };
  assert.deepEqual(await AuthService.me({ user: { id: 12 }, account }), account);
});
