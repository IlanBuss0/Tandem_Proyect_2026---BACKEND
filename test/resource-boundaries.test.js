import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import BD from '../src/db/BD.js';
import AuthRepository from '../src/repositories/AuthRepository.js';
import RefreshTokenRepository from '../src/repositories/RefreshTokenRepository.js';
import AuthorizationService from '../src/services/AuthorizationService.js';
import AuthorizationRepository from '../src/repositories/AuthorizationRepository.js';
import { authenticateSessionToken } from '../src/middlewares/auth.middleware.js';
import { signJwt } from '../src/modules/security/jwt.helper.js';
import { resourceAuthorizationMiddleware, RESOURCE_POLICIES, CATALOG_RESOURCES, filterResourceRows } from '../src/middlewares/resource-authorization.middleware.js';
import ProtectedStorageService, { parseStorageObject, protectStorageUrls } from '../src/services/ProtectedStorageService.js';
import { envConfig } from '../src/configs/env.config.js';
import ParticipanteChatService from '../src/services/ParticipanteChatService.js';
import ChatService from '../src/services/ChatService.js';
import AcompanamientoService from '../src/services/AcompanamientoService.js';
import BaseCrudController from '../src/controllers/base/BaseCrudController.js';

const denied = () => { throw Object.assign(new Error('denied'), { statusCode: 403 }); };

test('unregistered private generic CRUD cannot expose data without a resource policy', () => {
  const router = new BaseCrudController({}, class {}).router;
  let status;
  const res = { status(code) { status = code; return this; }, json() {} };
  router.stack[0].handle({ method: 'GET', account: { id_tipo_usuario: 1 } }, res, () => assert.fail('must not expose an unregistered private resource'));
  assert.equal(status, 403);
});

test('generic CRUD does not permit ordinary catalog writes even without the global registry', () => {
  const router = new BaseCrudController({ catalogTable: 'fixture' }, class {}).router;
  let status;
  const res = { status(code) { status = code; return this; }, json() {} };
  router.stack[0].handle({ method: 'POST', account: { id_tipo_usuario: 1 } }, res, () => assert.fail('must not write'));
  assert.equal(status, 403);
});
const foreign = { id: 2, id_usuario: 22, id_usuario_creador: 22, id_usuario_beneficiario: 22,
  id_perteneciente: 22, id_usuario_menor: 22, id_usuario_mayor: 23, id_tutor: 22, id_avatar: 22,
  id_archivo: 22, id_mensaje: 22, id_zona_segura: 22, id_dispositivo: 22,
  id_vinculo_profesional_perteneciente: 22 };

async function request(path, method, account, body) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => { req.user = { id: 1 }; req.account = account; next(); });
  app.use(resourceAuthorizationMiddleware);
  app.use((_req, res) => res.json({ reached: true }));
  app.use((error, _req, res, _next) => res.status(error.statusCode || 500).json({ message: error.message }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`, {
      method, headers: { 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: response.status, body: await response.json() };
  } finally { await new Promise(resolve => server.close(resolve)); }
}

function denyRelations(t) {
  t.mock.method(BD, 'queryOne', async () => null);
  t.mock.method(AuthorizationService, 'getUserContext', async () => ({ usuario: { id: 1, activo: true }, perteneciente: { id: 1 } }));
  for (const method of ['assertCanReadPertenecienteResource', 'assertCanReadPertenecientePermissions', 'assertCanReadProfesionalPermissions', 'assertCanAccessZonaSegura', 'assertCanAccessDispositivoLocation']) t.mock.method(AuthorizationService, method, async () => denied());
}

for (const [resource, policy] of Object.entries(RESOURCE_POLICIES)) {
  test(`${resource}: list removes unrelated rows`, async t => {
    denyRelations(t);
    assert.deepEqual(await filterResourceRows({ user: { id: 1 }, account: { id_tipo_usuario: 1 } }, policy, [foreign]), []);
  });
}

test('files: creator and real recipient allowed, stranger denied', async t => {
  t.mock.method(BD, 'queryOne', async () => null);
  await assert.doesNotReject(() => AuthorizationService.assertCanReadFile(1, { id: 2, id_usuario_creador: 1 }));
  await assert.rejects(() => AuthorizationService.assertCanReadFile(1, { id: 2, id_usuario_creador: 22 }), { statusCode: 403 });
  t.mock.method(BD, 'queryOne', async () => ({ id: 1 }));
  await assert.doesNotReject(() => AuthorizationService.assertCanReadFile(1, { id: 2, id_usuario_creador: 22 }));
});

for (const resource of CATALOG_RESOURCES) {
  test(`${resource}: ordinary accounts cannot change catalogs; admin can`, async () => {
    for (const method of ['POST', 'PUT', 'DELETE']) {
      assert.equal((await request(`/${resource}/2`, method, { id_tipo_usuario: 1 }, {})).status, 403);
      assert.equal((await request(`/${resource}/2`, method, { id_tipo_usuario: 4 }, {})).status, 200);
    }
  });
}

for (const resource of ['saldos-puntos', 'movimientos-puntos', 'compras-puntos', 'permisos-archivos', 'mensajes-archivos', 'pagos-suscripciones', 'beneficiarios-suscripciones']) {
  test(`${resource}: owning a row cannot authorize system writes`, async t => {
    t.mock.method(BD, 'queryOne', async () => ({ ...foreign, id_usuario: 1, id_perteneciente: 1 }));
    for (const method of ['POST', 'PUT', 'DELETE']) assert.equal((await request(`/${resource}/2`, method, { id_tipo_usuario: 1 }, { id_usuario: 1 })).status, 403);
  });
}

test('URL ownership is checked before the file controller receives a forged body', async t => {
  t.mock.method(BD, 'queryOne', async () => foreign);
  assert.equal((await request('/archivos/2', 'PUT', { id_tipo_usuario: 1 }, { id_usuario_creador: 1 })).status, 403);
  assert.equal((await request('/ArChIvOs/2', 'PUT', { id_tipo_usuario: 1 }, { id_usuario_creador: 1 })).status, 403);
  assert.equal((await request('/archivos/2abc', 'PUT', { id_tipo_usuario: 1 }, { id_usuario_creador: 1 })).status, 400);
});

test('contacts cannot be fabricated between third parties', async () => {
  assert.equal((await request('/contactos', 'POST', { id_tipo_usuario: 1 }, foreign)).status, 403);
});

test('generic tutor-link creation is denied; invitations remain separate', async () => {
  assert.equal((await request('/vinculos-tutor-pertenecientes', 'POST', { id_tipo_usuario: 2 }, { id_tutor: 1, id_perteneciente: 22 })).status, 403);
});

test('a revoked family or nonexistent account cannot authenticate', async t => {
  t.mock.method(AuthRepository, 'findSafeById', async () => ({ id: 1, activo: true }));
  t.mock.method(RefreshTokenRepository, 'isFamilyActive', async () => false);
  await assert.rejects(() => authenticateSessionToken(signJwt({ id: 1, sid: 'test' }), { fresh: true }), { statusCode: 401 });
  t.mock.method(RefreshTokenRepository, 'isFamilyActive', async () => true);
  assert.equal((await authenticateSessionToken(signJwt({ id: 1, sid: 'test' }), { fresh: true })).account.id, 1);
  t.mock.method(AuthRepository, 'findSafeById', async () => null);
  await assert.rejects(() => authenticateSessionToken(signJwt({ id: 1, sid: 'test' }), { fresh: true }), { statusCode: 401 });
});

test('leaving a chat prevents subsequent access even if Redis cached membership', async t => {
  const service = new ParticipanteChatService();
  service.ParticipanteChatRepository.getByChatAndUsuarioAsync = async () => ({ fecha_salida: new Date() });
  await assert.rejects(() => service.ensureActiveParticipantAsync(1, 1), /participante activo/);
});

test('group creation checks relationship for every invitee', async () => {
  const service = new ChatService();
  service.assertUsuariosActivosAsync = async () => {};
  service.validarRelacionDirectaPermitidaAsync = async () => denied();
  service.ChatRepository.createWithParticipantsAsync = async () => assert.fail('must not insert');
  await assert.rejects(() => service.createGroupChatAsync({ id_usuario_creador: 1, participantes: [22, 23], nombre: 'x' }), { statusCode: 403 });
});

test('accompaniment deletion checks management permission before deleting', async t => {
  t.mock.method(AuthorizationService, 'assertCanManageAccompaniment', async () => denied());
  const service = new AcompanamientoService();
  service.repository.deleteSharedNoteAsync = async () => assert.fail('must not delete');
  await assert.rejects(() => service.deleteNoteAsync(1, 22, 9), { statusCode: 403 });
});

test('storage rewrites legacy URLs and rejects unrelated hosts and traversal', async t => {
  const base = `${envConfig.supabaseUrl}/storage/v1/object/public/${envConfig.supabaseFilesBucket}/usuarios/1/doc.pdf`;
  assert.equal(protectStorageUrls({ url: base }).url, `${envConfig.appPublicUrl}/api/storage/${envConfig.supabaseFilesBucket}/usuarios/1/doc.pdf`);
  assert.equal(parseStorageObject('https://untrusted.invalid/storage/v1/object/public/files/a'), null);
  assert.equal(parseStorageObject(`${envConfig.supabaseUrl}/storage/v1/object/public/files/a%2F..%2Fb`), null);
  t.mock.method(BD, 'queryOne', async () => null);
  await assert.rejects(() => new ProtectedStorageService().assertAccess(1, envConfig.supabaseFilesBucket, 'usuarios/22/doc.pdf'), { statusCode: 403 });
});

test('private images inside activity metadata use the authenticated frontend proxy', () => {
  const url = `${envConfig.supabaseUrl}/storage/v1/object/public/${envConfig.supabaseFilesBucket}/usuarios/1/photo.png`;
  const description = `Juego: ${JSON.stringify({ steps: [{ image: url }] })}`;
  const result = protectStorageUrls(description);
  const metadata = JSON.parse(result.slice('Juego: '.length));
  assert.equal(metadata.steps[0].image, `${envConfig.appPublicUrl}/api/storage/${envConfig.supabaseFilesBucket}/usuarios/1/photo.png`);
  assert.equal(protectStorageUrls(result), result);
  assert.ok(metadata.steps[0].image.startsWith('http'), 'existing image renderers recognize this URL');
});
