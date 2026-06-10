import BD from '../src/db/BD.js';
import AuthorizationService from '../src/services/AuthorizationService.js';
import { PROFESIONAL_PERMISSIONS } from '../src/modules/security/permissions.constants.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function expectForbidden(callback, label) {
  try {
    await callback();
  } catch (error) {
    assert(error.statusCode === 403, `${label}: se esperaba 403 y llego ${error.statusCode}.`);
    return true;
  }

  throw new Error(`${label}: se esperaba rechazo 403.`);
}

async function getFixture() {
  const row = await BD.queryOne(
    `
      SELECT
        aa.id AS id_actividad_asignada,
        aa.id_perteneciente,
        pe.id_usuario AS id_usuario_perteneciente,
        t.id_usuario AS id_usuario_tutor
      FROM actividades_asignadas aa
      INNER JOIN pertenecientes pe ON pe.id = aa.id_perteneciente
      INNER JOIN vinculos_tutor_pertenecientes vtp ON vtp.id_perteneciente = pe.id
      INNER JOIN estados_vinculos ev ON ev.id = vtp.id_estado_vinculo
      INNER JOIN tutores t ON t.id = vtp.id_tutor
      INNER JOIN usuarios ut ON ut.id = t.id_usuario
      INNER JOIN usuarios up ON up.id = pe.id_usuario
      WHERE vtp.fecha_fin IS NULL
        AND ut.activo = true
        AND up.activo = true
        AND LOWER(ev.nombre) IN ('activo', 'activa', 'aprobado', 'aprobada', 'aceptado', 'aceptada')
      ORDER BY aa.id DESC
      LIMIT 1
    `,
  );

  assert(row, 'No se encontro actividad asignada con tutor activo para probar.');
  return row;
}

async function getNonLinkedUserId(idPerteneciente, excludedUserIds) {
  const row = await BD.queryOne(
    `
      SELECT u.id
      FROM usuarios u
      WHERE u.activo = true
        AND NOT (u.id = ANY($2::int[]))
        AND NOT EXISTS (
          SELECT 1
          FROM pertenecientes pe
          WHERE pe.id_usuario = u.id
            AND pe.id = $1
        )
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
    [idPerteneciente, excludedUserIds],
  );

  assert(row, 'No se encontro usuario sin vinculo para probar rechazo.');
  return row.id;
}

async function getProfessionalUserId(idPerteneciente) {
  const row = await BD.queryOne(
    `
      SELECT p.id_usuario
      FROM vinculos_profesional_pertenecientes vpp
      INNER JOIN profesionales p ON p.id = vpp.id_profesional
      INNER JOIN usuarios u ON u.id = p.id_usuario
      WHERE vpp.id_perteneciente = $1
        AND u.activo = true
      ORDER BY vpp.id DESC
      LIMIT 1
    `,
    [idPerteneciente],
  );

  return row?.id_usuario ?? null;
}

async function main() {
  const fixture = await getFixture();
  const nonLinkedUserId = await getNonLinkedUserId(fixture.id_perteneciente, [
    fixture.id_usuario_perteneciente,
    fixture.id_usuario_tutor,
  ]);
  const professionalUserId = await getProfessionalUserId(fixture.id_perteneciente);

  await AuthorizationService.assertCanReadPertenecienteResource(
    fixture.id_usuario_perteneciente,
    fixture.id_perteneciente,
    PROFESIONAL_PERMISSIONS.VER_HISTORIAL,
  );

  await AuthorizationService.assertCanReadPertenecienteResource(
    fixture.id_usuario_tutor,
    fixture.id_perteneciente,
    PROFESIONAL_PERMISSIONS.VER_HISTORIAL,
  );

  await expectForbidden(
    () => AuthorizationService.assertCanReadPertenecienteResource(
      nonLinkedUserId,
      fixture.id_perteneciente,
      PROFESIONAL_PERMISSIONS.VER_HISTORIAL,
    ),
    'usuario sin vinculo lee actividad',
  );

  let professionalAllowed = null;
  if (professionalUserId) {
    const result = await AuthorizationService.can(professionalUserId, 'profesional.historial.ver', {
      id_perteneciente: fixture.id_perteneciente,
    });
    professionalAllowed = result.allowed;
  }

  console.log(JSON.stringify({
    ok: true,
    actividad_asignada: {
      id: fixture.id_actividad_asignada,
      id_perteneciente: fixture.id_perteneciente,
    },
    allowed: {
      perteneciente: fixture.id_usuario_perteneciente,
      tutor: fixture.id_usuario_tutor,
      profesional_con_ver_historial: professionalAllowed,
    },
    denied: {
      usuario_sin_vinculo: nonLinkedUserId,
    },
  }, null, 2));
}

try {
  await main();
} finally {
  await BD.pool.end();
}
