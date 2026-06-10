import BD from '../src/db/BD.js';
import AuthorizationService from '../src/services/AuthorizationService.js';
import PermisoService from '../src/services/PermisoService.js';
import { AUTH_ACTIONS } from '../src/modules/security/permissions.constants.js';

const args = new Map();

for (const arg of process.argv.slice(2)) {
  const [key, value] = arg.split('=');
  args.set(key, value ?? true);
}

const pertenecientePermission = String(args.get('--permiso-perteneciente') ?? 'ChatearConProfesional');
const profesionalPermission = String(args.get('--permiso-profesional') ?? 'EnviarMensajes');
const motivo = String(args.get('--motivo') ?? 'Prueba de upsert de permisos');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function asBool(value) {
  return value === true || value === 'true';
}

async function getFixture() {
  const requestedPertenecienteId = args.has('--id-perteneciente') ? Number(args.get('--id-perteneciente')) : null;
  const requestedTutorUserId = args.has('--tutor-user-id') ? Number(args.get('--tutor-user-id')) : null;

  const filters = [];
  const params = [];

  if (requestedPertenecienteId) {
    params.push(requestedPertenecienteId);
    filters.push(`pe.id = $${params.length}`);
  }

  if (requestedTutorUserId) {
    params.push(requestedTutorUserId);
    filters.push(`ut.id = $${params.length}`);
  }

  const where = filters.length ? `AND ${filters.join(' AND ')}` : '';

  const fixture = await BD.queryOne(
    `
      SELECT
        pe.id AS id_perteneciente,
        up.id AS id_usuario_perteneciente,
        t.id AS id_tutor,
        ut.id AS id_usuario_tutor
      FROM vinculos_tutor_pertenecientes vtp
      INNER JOIN estados_vinculos ev ON ev.id = vtp.id_estado_vinculo
      INNER JOIN tutores t ON t.id = vtp.id_tutor
      INNER JOIN usuarios ut ON ut.id = t.id_usuario
      INNER JOIN pertenecientes pe ON pe.id = vtp.id_perteneciente
      INNER JOIN usuarios up ON up.id = pe.id_usuario
      WHERE vtp.fecha_fin IS NULL
        AND ut.activo = true
        AND up.activo = true
        AND LOWER(ev.nombre) IN ('activo', 'activa', 'aprobado', 'aprobada', 'aceptado', 'aceptada')
        ${where}
      ORDER BY pe.id, t.id
      LIMIT 1
    `,
    params,
  );

  assert(fixture, 'No se encontro un perteneciente con tutor activo para probar.');
  return fixture;
}

async function getNonTutorUserId(idPerteneciente, tutorUserId) {
  const requested = args.has('--non-tutor-user-id') ? Number(args.get('--non-tutor-user-id')) : null;
  if (requested) return requested;

  const row = await BD.queryOne(
    `
      SELECT u.id
      FROM usuarios u
      WHERE u.activo = true
        AND u.id <> $2
        AND NOT EXISTS (
          SELECT 1
          FROM tutores t
          INNER JOIN vinculos_tutor_pertenecientes vtp ON vtp.id_tutor = t.id
          INNER JOIN estados_vinculos ev ON ev.id = vtp.id_estado_vinculo
          WHERE t.id_usuario = u.id
            AND vtp.id_perteneciente = $1
            AND vtp.fecha_fin IS NULL
            AND LOWER(ev.nombre) IN ('activo', 'activa', 'aprobado', 'aprobada', 'aceptado', 'aceptada')
        )
      ORDER BY u.id
      LIMIT 1
    `,
    [idPerteneciente, tutorUserId],
  );

  assert(row, 'No se encontro un usuario no tutor para probar 403.');
  return row.id;
}

async function getCatalogId(tableName, permiso) {
  const row = await BD.queryOne(
    `
      SELECT id
      FROM ${tableName}
      WHERE LOWER(nombre) = LOWER($1)
      LIMIT 1
    `,
    [permiso],
  );

  assert(row, `No existe el permiso ${permiso} en ${tableName}. Ejecuta npm run seed:permissions.`);
  return row.id;
}

async function countPertenecienteHistory(idPerteneciente, idPermiso) {
  const row = await BD.queryOne(
    `
      SELECT COUNT(*)::int AS total
      FROM historial_permisos_otorgados_pertenecientes
      WHERE id_perteneciente = $1
        AND id_permiso_perteneciente = $2
    `,
    [idPerteneciente, idPermiso],
  );

  return row.total;
}

async function countProfesionalHistory(idVinculo, idPermiso) {
  const row = await BD.queryOne(
    `
      SELECT COUNT(*)::int AS total
      FROM historial_permisos_otorgados_profesionales
      WHERE id_vinculo_profesional_perteneciente = $1
        AND id_permiso_profesional = $2
    `,
    [idVinculo, idPermiso],
  );

  return row.total;
}

async function assertNonTutorFails(nonTutorUserId, idPerteneciente) {
  try {
    await AuthorizationService.assertCan(nonTutorUserId, AUTH_ACTIONS.TUTOR_PERMISOS_MODIFICAR, {
      id_perteneciente: idPerteneciente,
    });
  } catch (error) {
    assert(error.statusCode === 403, `Se esperaba 403 para usuario no tutor, llego ${error.statusCode}.`);
    return true;
  }

  throw new Error(`El usuario ${nonTutorUserId} pudo modificar permisos sin ser tutor activo.`);
}

async function testPertenecientePermission(fixture) {
  const idCatalogo = await getCatalogId('catalogo_permisos_pertenecientes', pertenecientePermission);
  const targetValue = args.has('--habilitado-perteneciente')
    ? asBool(args.get('--habilitado-perteneciente'))
    : true;

  let before = await AuthorizationService.getEffectivePertenecientePermissions(fixture.id_perteneciente);
  let previousValue = asBool(before.permisos[pertenecientePermission]?.habilitado);

  if (previousValue === targetValue) {
    await PermisoService.setPertenecientePermissionByName(
      fixture.id_perteneciente,
      { permiso: pertenecientePermission, habilitado: !targetValue, motivo: `${motivo} - preparacion` },
      fixture.id_usuario_tutor,
    );
    before = await AuthorizationService.getEffectivePertenecientePermissions(fixture.id_perteneciente);
    previousValue = asBool(before.permisos[pertenecientePermission]?.habilitado);
  }

  const historyBefore = await countPertenecienteHistory(fixture.id_perteneciente, idCatalogo);

  const first = await PermisoService.setPertenecientePermissionByName(
    fixture.id_perteneciente,
    { permiso: pertenecientePermission, habilitado: targetValue, motivo },
    fixture.id_usuario_tutor,
  );
  assert(first.permisos[pertenecientePermission]?.habilitado === targetValue, 'El permiso efectivo del perteneciente no se actualizo.');

  const historyAfterFirst = await countPertenecienteHistory(fixture.id_perteneciente, idCatalogo);
  assert(historyAfterFirst === historyBefore + 1, 'El historial del perteneciente no coincide con el cambio esperado.');

  const second = await PermisoService.setPertenecientePermissionByName(
    fixture.id_perteneciente,
    { permiso: pertenecientePermission, habilitado: targetValue, motivo },
    fixture.id_usuario_tutor,
  );
  assert(second.permisos[pertenecientePermission]?.habilitado === targetValue, 'El permiso efectivo del perteneciente cambio en la repeticion.');

  const historyAfterSecond = await countPertenecienteHistory(fixture.id_perteneciente, idCatalogo);
  assert(historyAfterSecond === historyAfterFirst, 'Repetir el mismo valor duplico historial del perteneciente.');

  return {
    permiso: pertenecientePermission,
    anterior: previousValue,
    nuevo: targetValue,
    historial_creado: historyAfterFirst - historyBefore,
  };
}

async function getProfessionalLink(idPerteneciente) {
  const requestedVinculoId = args.has('--id-vinculo') ? Number(args.get('--id-vinculo')) : null;
  const params = [idPerteneciente];
  const filters = ['vpp.id_perteneciente = $1'];

  if (requestedVinculoId) {
    params.push(requestedVinculoId);
    filters.push(`vpp.id = $${params.length}`);
  }

  return await BD.queryOne(
    `
      SELECT vpp.id
      FROM vinculos_profesional_pertenecientes vpp
      WHERE ${filters.join(' AND ')}
      ORDER BY vpp.id DESC
      LIMIT 1
    `,
    params,
  );
}

async function testProfesionalPermission(idVinculo, tutorUserId) {
  const idCatalogo = await getCatalogId('catalogo_permisos_profesionales', profesionalPermission);
  const targetValue = args.has('--habilitado-profesional')
    ? asBool(args.get('--habilitado-profesional'))
    : true;

  let before = await AuthorizationService.getEffectiveProfesionalPermissions(idVinculo);
  let previousValue = asBool(before.permisos[profesionalPermission]?.habilitado);

  if (previousValue === targetValue) {
    await PermisoService.setProfesionalPermissionByName(
      idVinculo,
      { permiso: profesionalPermission, habilitado: !targetValue, motivo: `${motivo} - preparacion` },
      tutorUserId,
    );
    before = await AuthorizationService.getEffectiveProfesionalPermissions(idVinculo);
    previousValue = asBool(before.permisos[profesionalPermission]?.habilitado);
  }

  const historyBefore = await countProfesionalHistory(idVinculo, idCatalogo);

  const first = await PermisoService.setProfesionalPermissionByName(
    idVinculo,
    { permiso: profesionalPermission, habilitado: targetValue, motivo },
    tutorUserId,
  );
  assert(first.permisos[profesionalPermission]?.habilitado === targetValue, 'El permiso efectivo profesional no se actualizo.');

  const historyAfterFirst = await countProfesionalHistory(idVinculo, idCatalogo);
  assert(historyAfterFirst === historyBefore + 1, 'El historial profesional no coincide con el cambio esperado.');

  await PermisoService.setProfesionalPermissionByName(
    idVinculo,
    { permiso: profesionalPermission, habilitado: targetValue, motivo },
    tutorUserId,
  );

  const historyAfterSecond = await countProfesionalHistory(idVinculo, idCatalogo);
  assert(historyAfterSecond === historyAfterFirst, 'Repetir el mismo valor duplico historial profesional.');

  return {
    id_vinculo_profesional_perteneciente: idVinculo,
    permiso: profesionalPermission,
    anterior: previousValue,
    nuevo: targetValue,
    historial_creado: historyAfterFirst - historyBefore,
  };
}

async function main() {
  const fixture = await getFixture();
  const nonTutorUserId = await getNonTutorUserId(fixture.id_perteneciente, fixture.id_usuario_tutor);

  await AuthorizationService.assertCan(fixture.id_usuario_tutor, AUTH_ACTIONS.TUTOR_PERMISOS_MODIFICAR, {
    id_perteneciente: fixture.id_perteneciente,
  });

  const perteneciente = await testPertenecientePermission(fixture);
  await assertNonTutorFails(nonTutorUserId, fixture.id_perteneciente);

  const profesionalLink = await getProfessionalLink(fixture.id_perteneciente);
  const profesional = profesionalLink
    ? await testProfesionalPermission(profesionalLink.id, fixture.id_usuario_tutor)
    : null;

  console.log(JSON.stringify({
    ok: true,
    fixture: {
      id_perteneciente: fixture.id_perteneciente,
      id_usuario_perteneciente: fixture.id_usuario_perteneciente,
      id_tutor: fixture.id_tutor,
      id_usuario_tutor: fixture.id_usuario_tutor,
      id_usuario_no_tutor: nonTutorUserId,
    },
    perteneciente,
    profesional,
  }, null, 2));
}

try {
  await main();
} finally {
  await BD.pool.end();
}
