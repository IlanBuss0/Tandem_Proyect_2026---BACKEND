import BD from '../src/db/BD.js';
import AuthorizationService from '../src/services/AuthorizationService.js';
import PermisoService from '../src/services/PermisoService.js';

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
        pe.id AS id_perteneciente,
        pe.id_usuario AS id_usuario_perteneciente,
        t.id_usuario AS id_usuario_tutor,
        c.id AS id_chat
      FROM pertenecientes pe
      INNER JOIN usuarios up ON up.id = pe.id_usuario
      INNER JOIN vinculos_tutor_pertenecientes vtp ON vtp.id_perteneciente = pe.id
      INNER JOIN estados_vinculos ev ON ev.id = vtp.id_estado_vinculo
      INNER JOIN tutores t ON t.id = vtp.id_tutor
      INNER JOIN usuarios ut ON ut.id = t.id_usuario
      INNER JOIN participantes_chats pc ON pc.id_usuario = pe.id_usuario AND pc.fecha_salida IS NULL
      INNER JOIN chats c ON c.id = pc.id_chat AND c.activo = true
      WHERE up.activo = true
        AND ut.activo = true
        AND vtp.fecha_fin IS NULL
        AND LOWER(ev.nombre) IN ('activo', 'activa', 'aprobado', 'aprobada', 'aceptado', 'aceptada')
      ORDER BY c.id DESC
      LIMIT 1
    `,
  );

  assert(row, 'No se encontro un perteneciente con tutor activo y chat para probar.');
  return row;
}

async function main() {
  const fixture = await getFixture();
  const before = await AuthorizationService.getEffectivePertenecientePermissions(fixture.id_perteneciente);
  const originalValue = before.permisos.EnviarMensajes?.habilitado === true;

  await PermisoService.setPertenecientePermissionByName(
    fixture.id_perteneciente,
    { permiso: 'EnviarMensajes', habilitado: false, motivo: 'Prueba bloqueo envio mensajes' },
    fixture.id_usuario_tutor,
  );

  await expectForbidden(
    () => AuthorizationService.assertCanSendMessageToChat(fixture.id_usuario_perteneciente, fixture.id_chat),
    'perteneciente con EnviarMensajes deshabilitado',
  );

  await PermisoService.setPertenecientePermissionByName(
    fixture.id_perteneciente,
    { permiso: 'EnviarMensajes', habilitado: true, motivo: 'Prueba habilita envio mensajes' },
    fixture.id_usuario_tutor,
  );

  await AuthorizationService.assertCanSendMessageToChat(fixture.id_usuario_perteneciente, fixture.id_chat);

  if (originalValue !== true) {
    await PermisoService.setPertenecientePermissionByName(
      fixture.id_perteneciente,
      { permiso: 'EnviarMensajes', habilitado: originalValue, motivo: 'Restaurar valor previo de prueba' },
      fixture.id_usuario_tutor,
    );
  }

  console.log(JSON.stringify({
    ok: true,
    fixture,
    checked: {
      EnviarMensajes_false_blocks_send: true,
      EnviarMensajes_true_allows_send: true,
    },
  }, null, 2));
}

try {
  await main();
} finally {
  await BD.pool.end();
}
