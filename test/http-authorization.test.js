import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/server.js';
import BD from '../src/db/BD.js';
import AuthRepository from '../src/repositories/AuthRepository.js';
import RefreshTokenRepository from '../src/repositories/RefreshTokenRepository.js';
import AuthorizationService from '../src/services/AuthorizationService.js';
import { signJwt } from '../src/modules/security/jwt.helper.js';
import { CATALOG_RESOURCES } from '../src/middlewares/resource-authorization.middleware.js';
import ProtectedStorageService from '../src/services/ProtectedStorageService.js';
import { envConfig } from '../src/configs/env.config.js';

async function withApi(t, run) {
  let writes = 0;
  t.mock.method(AuthRepository, 'findSafeById', async id => ({ id, activo: true, email_verificado: id !== 8, id_tipo_usuario: id }));
  t.mock.method(RefreshTokenRepository, 'isFamilyActive', async (_id, sid) => sid === 'fixture-session');
  t.mock.method(AuthorizationService, 'getUserContext', async id => ({ usuario: { id, activo: true }, perteneciente: id === 1 ? { id: 1 } : null }));
  const file = id => ({ id, activo: true, id_usuario_creador: id, nombre_archivo: 'synthetic.pdf', url: 'https://example.invalid/synthetic.pdf' });
  t.mock.method(BD, 'query', async sql => sql.includes('FROM archivos') ? [file(1), file(22)] : []);
  t.mock.method(BD, 'queryOne', async (sql, values = []) => {
    if (sql.includes('FROM archivos') && !sql.includes('EXISTS')) return file(Number(values[0]));
    if (sql.includes('EXISTS')) return null;
    return null;
  });
  t.mock.method(BD, 'execute', async sql => { if (/^\s*(INSERT|UPDATE|DELETE)/i.test(sql)) { writes++; throw new Error('Unexpected write'); } return 0; });
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const request = (path, { user = 1, method = 'GET', body, sid = 'fixture-session' } = {}) => {
    const headers = { 'Content-Type': 'application/json', 'x-csrf-token': 'fixture-csrf' };
    if (user) headers.cookie = `tandem_access_token=${signJwt({ id: user, sid })}; tandem_csrf_token=fixture-csrf`;
    return fetch(`http://127.0.0.1:${server.address().port}${path}`, { method, headers, redirect: 'manual', ...(body ? { body: JSON.stringify(body) } : {}) });
  };
  try { await run(request); assert.equal(writes, 0, 'negative tests must never reach writes'); }
  finally { await new Promise(resolve => server.close(resolve)); }
}

test('real API: anonymous, unverified and revoked sessions cannot read protected files', async t => withApi(t, async request => {
  assert.equal((await request('/api/archivos/22', { user: null })).status, 401);
  assert.equal((await request('/api/archivos/22', { user: 8 })).status, 403);
  assert.equal((await request('/api/archivos/22', { sid: 'revoked' })).status, 401);
}));

test('real API: own file works; other families cannot read, download, rename or delete it', async t => withApi(t, async request => {
  assert.equal((await request('/api/archivos/1')).status, 200);
  const list = await (await request('/api/archivos')).json();
  assert.deepEqual(list.map(file => file.id), [1]);
  for (const user of [1, 2, 3]) {
    for (const suffix of ['', '/download']) assert.equal((await request(`/api/archivos/22${suffix}`, { user })).status, 403);
    for (const method of ['PUT', 'DELETE']) assert.equal((await request('/api/archivos/22', { user, method, body: { id_usuario_creador: user } })).status, 403);
  }
  assert.equal((await request('/api/ArChIvOs/22', { method: 'PUT', body: { id_usuario_creador: 1 } })).status, 403);
  assert.equal((await request('/api/archivos/22abc', { method: 'PUT', body: { id_usuario_creador: 1 } })).status, 400);
}));

test('real API: all catalog families deny writes for each ordinary role', async t => withApi(t, async request => {
  for (const resource of CATALOG_RESOURCES) {
    assert.equal((await request(`/api/${resource}`)).status, 200, `catalog remains readable: ${resource}`);
    for (const user of [1, 2, 3]) {
      for (const method of ['POST', 'PUT', 'DELETE']) {
        const response = await request(`/api/${resource}${method === 'POST' ? '' : '/22'}`, { user, method, body: {} });
        assert.equal(response.status, 403, `${user} ${method} ${resource}`);
      }
    }
  }
}));

test('real API: generic sharing/attachment writes, forged family links and sync are denied', async t => withApi(t, async request => {
  for (const resource of ['permisos-archivos', 'mensajes-archivos', 'vinculos-tutor-pertenecientes', 'saldos-puntos', 'movimientos-puntos', 'compras-puntos', 'pagos-suscripciones', 'beneficiarios-suscripciones']) {
    assert.equal((await request(`/api/${resource}`, { method: 'POST', body: { id_usuario: 1, id_perteneciente: 1, id_tutor: 1 } })).status, 403, resource);
  }
  assert.equal((await request('/api/pictogramas/sync', { method: 'POST', body: {} })).status, 403);
  assert.equal((await request('/api/pictograms/sync', { user: 8, method: 'POST', body: {} })).status, 403);
}));

test('real API: tutor lookup by user ID cannot bypass the resource policy', async t => withApi(t, async request => {
  const original = BD.queryOne;
  t.mock.method(BD, 'queryOne', async (sql, values) => sql.includes('FROM tutores') ? { id: 22, id_usuario: 22 } : original(sql, values));
  assert.equal((await request('/api/tutores/usuario/22')).status, 403);
}));

test('real API: private object bytes require ownership; only published pictograms are anonymous', async t => withApi(t, async request => {
  const original = BD.queryOne;
  t.mock.method(BD, 'queryOne', async (sql, values) => {
    if (sql.includes('FROM archivos WHERE url=')) return { id: 22, activo: true, id_usuario_creador: values[0].endsWith('/own.png') ? 1 : 22 };
    return original(sql, values);
  });
  t.mock.method(ProtectedStorageService.prototype, 'download', async () => ({ data: Buffer.from('synthetic image'), headers: { 'content-type': 'image/png' } }));
  const path = `/api/storage/${envConfig.supabaseFilesBucket}`;
  assert.equal((await request(`${path}/other.png`, { user: null })).status, 401);
  assert.equal((await request(`${path}/other.png`)).status, 403);
  const own = await request(`${path}/own.png`);
  assert.equal(own.status, 200);
  assert.equal(await own.text(), 'synthetic image');
  assert.equal(own.headers.get('cache-control'), 'private, no-store');
  t.mock.method(ProtectedStorageService.prototype, 'isPublishedPictogram', async (_bucket, objectPath) => objectPath === 'published.png');
  assert.equal((await request(`${path}/published.png`, { user: null })).status, 200);
}));
