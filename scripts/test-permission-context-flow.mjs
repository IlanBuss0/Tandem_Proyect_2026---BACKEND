import BD from '../src/db/BD.js';
import AuthorizationService from '../src/services/AuthorizationService.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function getTutorUserId() {
  const row = await BD.queryOne(
    `
      SELECT t.id_usuario
      FROM tutores t
      INNER JOIN usuarios u ON u.id = t.id_usuario
      INNER JOIN vinculos_tutor_pertenecientes vtp ON vtp.id_tutor = t.id
      INNER JOIN estados_vinculos ev ON ev.id = vtp.id_estado_vinculo
      WHERE u.activo = true
        AND vtp.fecha_fin IS NULL
        AND LOWER(ev.nombre) IN ('activo', 'activa', 'aprobado', 'aprobada', 'aceptado', 'aceptada')
      ORDER BY t.id
      LIMIT 1
    `,
  );

  return row?.id_usuario ?? null;
}

async function getPertenecienteUserId() {
  const row = await BD.queryOne(
    `
      SELECT pe.id_usuario
      FROM pertenecientes pe
      INNER JOIN usuarios u ON u.id = pe.id_usuario
      WHERE u.activo = true
      ORDER BY pe.id
      LIMIT 1
    `,
  );

  return row?.id_usuario ?? null;
}

async function getProfesionalUserId() {
  const row = await BD.queryOne(
    `
      SELECT p.id_usuario
      FROM profesionales p
      INNER JOIN usuarios u ON u.id = p.id_usuario
      INNER JOIN vinculos_profesional_pertenecientes vpp ON vpp.id_profesional = p.id
      WHERE u.activo = true
      ORDER BY p.id
      LIMIT 1
    `,
  );

  return row?.id_usuario ?? null;
}

async function validateTutorContext(idUsuario) {
  const context = await AuthorizationService.getPermissionContext(idUsuario);
  assert(context.roles.includes('Tutor'), 'El contexto no incluye rol Tutor.');
  assert(context.tutor?.id, 'El contexto de tutor no incluye tutor.');
  assert(Array.isArray(context.pertenecientes), 'El contexto de tutor no incluye pertenecientes.');
  assert(context.pertenecientes.length > 0, 'El tutor de prueba no tiene pertenecientes activos.');
  assert(context.pertenecientes[0].permisos_efectivos?.permisos, 'El perteneciente del tutor no tiene permisos efectivos.');
  return {
    id_usuario: idUsuario,
    rol: context.rol,
    roles: context.roles,
    total_pertenecientes: context.pertenecientes.length,
  };
}

async function validatePertenecienteContext(idUsuario) {
  const context = await AuthorizationService.getPermissionContext(idUsuario);
  assert(context.roles.includes('Perteneciente'), 'El contexto no incluye rol Perteneciente.');
  assert(context.perteneciente?.id, 'El contexto no incluye perteneciente.');
  assert(context.perteneciente.permisos_efectivos?.permisos, 'El perteneciente no tiene permisos efectivos.');
  return {
    id_usuario: idUsuario,
    rol: context.rol,
    roles: context.roles,
    id_perteneciente: context.perteneciente.id,
  };
}

async function validateProfesionalContext(idUsuario) {
  const context = await AuthorizationService.getPermissionContext(idUsuario);
  assert(context.roles.includes('Profesional'), 'El contexto no incluye rol Profesional.');
  assert(context.profesional?.id, 'El contexto no incluye profesional.');
  assert(Array.isArray(context.vinculos), 'El contexto de profesional no incluye vinculos.');
  assert(context.vinculos.length > 0, 'El profesional de prueba no tiene vinculos.');
  assert(context.vinculos[0].permisos_efectivos?.permisos, 'El vinculo profesional no tiene permisos efectivos.');
  return {
    id_usuario: idUsuario,
    rol: context.rol,
    roles: context.roles,
    total_vinculos: context.vinculos.length,
  };
}

async function main() {
  const tutorUserId = await getTutorUserId();
  const pertenecienteUserId = await getPertenecienteUserId();
  const profesionalUserId = await getProfesionalUserId();

  assert(tutorUserId, 'No se encontro tutor activo con perteneciente para probar contexto.');
  assert(pertenecienteUserId, 'No se encontro perteneciente activo para probar contexto.');
  assert(profesionalUserId, 'No se encontro profesional activo con vinculos para probar contexto.');

  const result = {
    ok: true,
    tutor: await validateTutorContext(tutorUserId),
    perteneciente: await validatePertenecienteContext(pertenecienteUserId),
    profesional: await validateProfesionalContext(profesionalUserId),
  };

  console.log(JSON.stringify(result, null, 2));
}

try {
  await main();
} finally {
  await BD.pool.end();
}
