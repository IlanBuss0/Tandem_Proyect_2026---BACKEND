import test from 'node:test';
import assert from 'node:assert/strict';
import BD from '../src/db/BD.js';
import AuthorizationService from '../src/services/AuthorizationService.js';
import AuthorizationRepository from '../src/repositories/AuthorizationRepository.js';
import PermisoService from '../src/services/PermisoService.js';
import PermisoController from '../src/controllers/PermisoController.js';
import EvaluacionController from '../src/controllers/EvaluacionAutonomiaController.js';
import MensajeController from '../src/controllers/MensajeController.js';
import UsuarioController from '../src/controllers/UsuarioController.js';
import ActividadAsignadaService from '../src/services/ActividadAsignadaService.js';
import ReporteProfesionalService from '../src/services/ReporteProfesionalService.js';
import AvatarService from '../src/services/AvatarService.js';
import { cacheService } from '../src/services/CacheService.js';
import InviteVinculoService from '../src/services/InviteVinculoService.js';
import VinculoProfesionalPertenecienteService from '../src/services/VinculoProfesionalPertenecienteService.js';

const forbidden = () => { throw Object.assign(new Error('Forbidden'), { statusCode: 403 }); };
const handler = (router, path, method) => router.stack.find(layer => layer.route?.path === path && layer.route.methods[method]).route.stack.at(-1).handle;
const response = () => ({ statusCode: 200, payload: null, status(code) { this.statusCode = code; return this; }, json(body) { this.payload = body; return this; }, send(body) { this.payload = body; return this; } });

test('permission PUT authorizes the URL row, never the owner supplied in the body', async t => {
  t.mock.method(PermisoService, 'getPertenecientePermissionById', async () => ({ id: 9, id_perteneciente: 22 }));
  t.mock.method(AuthorizationService, 'assertCan', async (_user, _action, context) => { assert.equal(context.id_perteneciente, 22); forbidden(); });
  t.mock.method(PermisoService, 'updatePerteneciente', async () => assert.fail('must not update'));
  let error;
  await handler(PermisoController, '/perteneciente/:id', 'put')({ user: { id: 1 }, params: { id: '9' }, body: { id_perteneciente: 1 } }, response(), value => { error = value; });
  assert.equal(error.statusCode, 403);
});

test('professional permission PUT authorizes the original link', async t => {
  t.mock.method(PermisoService, 'getProfesionalPermissionById', async () => ({ id: 9, id_vinculo_profesional_perteneciente: 22 }));
  t.mock.method(AuthorizationService, 'assertCanModifyProfesionalPermissions', async (_user, id) => { assert.equal(id, 22); forbidden(); });
  let error;
  await handler(PermisoController, '/profesional/:id', 'put')({ user: { id: 1 }, params: { id: '9' }, body: { id_vinculo_profesional_perteneciente: 1 } }, response(), value => { error = value; });
  assert.equal(error.statusCode, 403);
});

test('rejected or revoked professional links do not appear in permission context, including stale cached data', async t => {
  t.mock.method(cacheService, 'get', async () => ({ vinculos: [{ id: 22 }] }));
  t.mock.method(AuthorizationService, 'getUserContext', async () => ({ usuario: { id: 3 }, profesional: { id: 3 } }));
  t.mock.method(AuthorizationRepository, 'getProfesionalVinculos', async () => [{ id_perteneciente: 22 }]);
  t.mock.method(AuthorizationService, 'canProfesionalPermission', async () => ({ allowed: false }));
  assert.deepEqual((await AuthorizationService.getPermissionContext(3)).vinculos, []);
});

test('clinical evaluation always records the authenticated professional as author', async t => {
  t.mock.method(AuthorizationService, 'getUserContext', async () => ({ usuario: { id: 3 }, profesional: { id: 3 } }));
  t.mock.method(AuthorizationService, 'canProfesionalPermission', async () => ({ allowed: true }));
  t.mock.method(BD, 'queryOne', async (sql, values) => { assert.match(sql, /INSERT INTO evaluaciones_autonomias/); assert.equal(values[1], 3); return { id: 1 }; });
  const res = response();
  await handler(EvaluacionController, '', 'post')({ user: { id: 3 }, body: { id_perteneciente: 1, id_profesional: 999, id_nivel_apoyo_nuevo: 1, id_autonomia_operativa_nueva: 1, puede_autogestionarse_nuevo: false, fecha_evaluacion: '2026-01-01' } }, res);
  assert.equal(res.statusCode, 201);
});

test('a deleted message does not return content through GET by ID', async t => {
  t.mock.method(BD, 'execute', async () => 0);
  t.mock.method(BD, 'queryOne', async () => ({ id: 1, eliminado: true, contenido: 'synthetic-private-content' }));
  const res = response();
  await handler(MensajeController, '/:id', 'get')({ user: { id: 1 }, params: { id: '1' } }, res);
  assert.equal(res.statusCode, 404);
  assert.ok(!JSON.stringify(res.payload).includes('synthetic-private-content'));
});

test('own user update cannot bypass the disabled profile permission', async t => {
  t.mock.method(AuthorizationService, 'getUserContext', async () => ({ perteneciente: { id: 1 } }));
  t.mock.method(AuthorizationService, 'assertCanWritePertenecienteResource', async () => forbidden());
  const res = response();
  await handler(UsuarioController, '/:id', 'put')({ user: { id: 1 }, params: { id: '1' }, body: { nombre: 'x' } }, res);
  assert.equal(res.statusCode, 403);
});

test('an owned assignment cannot reference a private activity created by another family', async () => {
  const service = new ActividadAsignadaService();
  service.ActividadPersonalizadaRepository.getByIdAsync = async () => ({ id: 22, id_usuario_creador: 22 });
  await assert.rejects(() => service.assertCanUseCustomActivityAsync(22, 1), { statusCode: 403 });
});

test('reports cannot use the weaker active-link check to bypass central authorization', async t => {
  const service = new ReporteProfesionalService();
  service.VinculoProfesionalPertenecienteRepository.getByProfesionalYPertenecienteAsync = async () => ({ estado_vinculo: 'activo' });
  service.resolveProfesionalUsuarioIdAsync = async () => 3;
  t.mock.method(AuthorizationService, 'assertCanReadPertenecienteResource', async () => forbidden());
  await assert.rejects(() => service.assertVinculoActivoAsync(3, 22), { statusCode: 403 });
});

test('avatar cannot equip an item outside its inventory', async t => {
  const service = new AvatarService();
  t.mock.method(BD, 'query', async () => []);
  const avatar = { avatar_json: JSON.stringify({ equipped: { ropa: 'shirt-purple' } }) };
  await assert.rejects(() => service.assertOwnedEquipmentAsync(avatar, 1), { statusCode: 403 });
  t.mock.method(BD, 'query', async () => [{ codigo_item_externo: 'shirt-purple' }]);
  await assert.doesNotReject(() => service.assertOwnedEquipmentAsync(avatar, 1));
});

test('a tutelado cannot add another guardian without the sensitive permission', async t => {
  const service = new InviteVinculoService();
  service._getOrCreatePertenecienteForInvite = async () => ({ id: 1 });
  service.vinculoService.getByTutorYPertenecienteAsync = async () => null;
  service.vinculoService.getByPertenecienteIdAsync = async () => [{ id: 1, fecha_fin: null }];
  service.vinculoService.createAsync = async () => assert.fail('must not create link');
  t.mock.method(AuthorizationService, 'assertCan', async () => forbidden());
  await assert.rejects(() => service._processJoin(1, { id: 1, estado: 'activo', fecha_expiracion: new Date(Date.now() + 60000), id_tutor_creador: 22 }), { statusCode: 403 });
});

test('a professional invitation issued by a revoked guardian cannot grant access', async t => {
  const service = new VinculoProfesionalPertenecienteService();
  service.VinculoProfesionalPertenecienteRepository.getInviteByCodigoAsync = async () => ({ id: 1, estado: 'activo', fecha_expiracion: new Date(Date.now() + 60000), id_tutor_creador: 22, id_perteneciente: 1 });
  t.mock.method(AuthorizationService, 'getUserContext', async id => id === 3 ? { profesional: { id: 3 } } : { tutor: { id: 22 } });
  t.mock.method(AuthorizationRepository, 'getTutorById', async () => ({ id_usuario: 22 }));
  t.mock.method(AuthorizationService, 'canTutorActOnPerteneciente', async () => ({ allowed: false }));
  await assert.rejects(() => service.joinProfessionalInviteAsync({ idUsuarioProfesional: 3, codigo: 'TEST-TEST' }), { statusCode: 403 });
});
