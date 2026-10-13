import './helpers/test-env.js';
import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import AuthorizationService from '../src/services/AuthorizationService.js';
import AuthorizationRepository from '../src/repositories/AuthorizationRepository.js';
import PertenecienteService from '../src/services/PertenecienteService.js';
import { PROFESIONAL_PERMISSIONS } from '../src/modules/security/permissions.constants.js';
import { __setCacheRedisClientProviderForTests } from '../src/cache/cacheHelper.js';
import { createFakeRedis } from './helpers/fake-redis.js';

const originals = { ...AuthorizationRepository };
afterEach(() => {
  Object.assign(AuthorizationRepository, originals);
  __setCacheRedisClientProviderForTests(null);
});

const ALL_IDS = [1, 2, 3, 4, 5];
const approvedLink = (id, idPerteneciente) => ({
  id, id_profesional: 30, id_perteneciente: idPerteneciente, estado_vinculo: 'activo',
  estado_validacion_profesional: 'verificado', requiere_aprobacion_tutor: false,
  usuario_profesional_activo: true, usuario_perteneciente_activo: true,
});

function stubScenario({ perteneciente = null, tutor = null, profesional = null }) {
  const counts = { queries: 0 };
  const count = (fn) => async (...args) => { counts.queries += 1; return fn(...args); };
  Object.assign(AuthorizationRepository, {
    getUsuarioById: count(async (id) => ({ id, activo: true, id_tipo_usuario: 2 })),
    getPertenecienteByUsuarioId: count(async () => perteneciente),
    getTutorByUsuarioId: count(async () => tutor),
    getProfesionalByUsuarioId: count(async () => profesional),
    isTutorActivoForPerteneciente: count(async (_t, id) => [2, 4].includes(Number(id))),
    getActiveTutorPertenecienteIds: count(async () => [2, 4]),
    getApprovedProfessionalLinks: count(async () => [approvedLink(100, 3), approvedLink(101, 5)]),
    getApprovedProfessionalLink: count(async (_p, id) => ({ 3: approvedLink(100, 3), 5: approvedLink(101, 5) }[id] ?? null)),
    // Vinculo 101 (perteneciente 5) tiene VER_HISTORIAL apagado.
    getProfesionalPermission: count(async (idVinculo) => ({ habilitado: idVinculo !== 101 })),
    getPertenecienteById: count(async () => ({ puede_autogestionarse: false })),
  });
  return counts;
}

async function oneByOne(idUsuario) {
  const allowed = new Set();
  for (const id of ALL_IDS) {
    try {
      await AuthorizationService.assertCanReadPertenecienteResource(idUsuario, id, PROFESIONAL_PERMISSIONS.VER_HISTORIAL);
      allowed.add(id);
    } catch (error) {
      if (error.statusCode !== 403) throw error;
    }
  }
  return allowed;
}

for (const [name, scenario] of [
  ['perteneciente', { perteneciente: { id: 1 } }],
  ['tutor', { tutor: { id: 20 } }],
  ['profesional', { profesional: { id: 30 } }],
  ['tutor y perteneciente', { perteneciente: { id: 1 }, tutor: { id: 20 } }],
  ['sin rol', {}],
]) {
  test(`filtro por lotes = chequeo uno por uno (${name})`, async () => {
    __setCacheRedisClientProviderForTests(() => null);
    stubScenario(scenario);
    const batch = await AuthorizationService.filterReadablePertenecienteIds(50, ALL_IDS, PROFESIONAL_PERMISSIONS.VER_HISTORIAL);
    assert.deepEqual([...batch].sort(), [...(await oneByOne(50))].sort());
  });
}

test('GET /api/pertenecientes: un tutor solo recibe sus vinculados y con pocas consultas', async () => {
  __setCacheRedisClientProviderForTests(() => null);
  const counts = stubScenario({ tutor: { id: 20 } });
  const service = new PertenecienteService();
  service.getAllAsync = async () => ALL_IDS.map((id) => ({ id, id_usuario: 100 + id }));
  const visible = await service.getVisibleForUserAsync(50);
  assert.deepEqual(visible.map((p) => p.id), [2, 4]);
  assert.ok(counts.queries <= 5, `consultas: ${counts.queries}`);
});

test('la lista cacheada es por usuario y se invalida al cambiar vinculos', async () => {
  const redis = createFakeRedis();
  __setCacheRedisClientProviderForTests(() => redis);
  stubScenario({ tutor: { id: 20 } });
  const service = new PertenecienteService();
  service.getAllAsync = async () => ALL_IDS.map((id) => ({ id, id_usuario: 100 + id }));

  assert.deepEqual((await service.getVisibleForUserAsync(50)).map((p) => p.id), [2, 4]);
  AuthorizationRepository.getActiveTutorPertenecienteIds = async () => [2];
  assert.deepEqual((await service.getVisibleForUserAsync(50)).map((p) => p.id), [2, 4], 'sale del cache');

  await AuthorizationService.invalidateAllForUser();
  assert.deepEqual((await service.getVisibleForUserAsync(50)).map((p) => p.id), [2]);

  // Otro usuario (profesional) nunca recibe la lista cacheada del tutor.
  stubScenario({ profesional: { id: 30 } });
  assert.deepEqual((await service.getVisibleForUserAsync(51)).map((p) => p.id), [3]);
});

test('admin ve todos', async () => {
  __setCacheRedisClientProviderForTests(() => null);
  const service = new PertenecienteService();
  service.getAllAsync = async () => ALL_IDS.map((id) => ({ id }));
  assert.equal((await service.getVisibleForUserAsync(1, { isAdmin: true })).length, 5);
});
