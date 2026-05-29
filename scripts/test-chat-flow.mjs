import BD from '../src/db/BD.js';
import ChatService from '../src/services/ChatService.js';
import MensajeService from '../src/services/MensajeService.js';

const args = new Map();

for (const arg of process.argv.slice(2)) {
  const [key, value] = arg.split('=');
  args.set(key, value ?? true);
}

const profesionalUserId = Number(args.get('--profesional-user-id') ?? 6);
const pertenecienteUserId = Number(args.get('--perteneciente-user-id') ?? 17);
const tutorUserId = Number(args.get('--tutor-user-id') ?? 5);
const tipoChatId = Number(args.get('--tipo-chat-id') ?? 1);
const tipoMensajeId = Number(args.get('--tipo-mensaje-id') ?? 1);
const shouldApproveTutor = args.has('--approve-tutor');

function assertPositiveInt(value, name) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} debe ser un entero positivo.`);
  }
}

async function getRequiredRow(sql, params, errorMessage) {
  const row = await BD.queryOne(sql, params);
  if (!row) throw new Error(errorMessage);
  return row;
}

async function main() {
  assertPositiveInt(profesionalUserId, '--profesional-user-id');
  assertPositiveInt(pertenecienteUserId, '--perteneciente-user-id');
  assertPositiveInt(tutorUserId, '--tutor-user-id');
  assertPositiveInt(tipoChatId, '--tipo-chat-id');
  assertPositiveInt(tipoMensajeId, '--tipo-mensaje-id');

  const profesional = await getRequiredRow(
    `SELECT p.id, p.id_usuario, evp.nombre AS estado_validacion
     FROM profesionales p
     LEFT JOIN estados_validaciones_profesionales evp ON evp.id = p.id_estado_validacion
     WHERE p.id_usuario = $1`,
    [profesionalUserId],
    `El usuario ${profesionalUserId} no es profesional.`,
  );

  const perteneciente = await getRequiredRow(
    `SELECT pe.id, pe.id_usuario, u.fecha_nacimiento
     FROM pertenecientes pe
     INNER JOIN usuarios u ON u.id = pe.id_usuario
     WHERE pe.id_usuario = $1`,
    [pertenecienteUserId],
    `El usuario ${pertenecienteUserId} no es perteneciente.`,
  );

  const tutor = await getRequiredRow(
    `SELECT id, id_usuario FROM tutores WHERE id_usuario = $1`,
    [tutorUserId],
    `El usuario ${tutorUserId} no es tutor.`,
  );

  let vinculo = await getRequiredRow(
    `SELECT vpp.*, ev.nombre AS estado_vinculo
     FROM vinculos_profesional_pertenecientes vpp
     LEFT JOIN estados_vinculos ev ON ev.id = vpp.id_estado_vinculo
     WHERE vpp.id_profesional = $1
       AND vpp.id_perteneciente = $2`,
    [profesional.id, perteneciente.id],
    `No existe vinculo profesional-perteneciente entre profesional ${profesional.id} y perteneciente ${perteneciente.id}.`,
  );

  if (shouldApproveTutor) {
    await BD.execute(
      `UPDATE vinculos_profesional_pertenecientes
       SET fue_aprobado_por_tutor = true,
           id_tutor_aprobador = $3,
           fecha_resolucion = COALESCE(fecha_resolucion, CURRENT_DATE)
       WHERE id_profesional = $1
         AND id_perteneciente = $2`,
      [profesional.id, perteneciente.id, tutor.id],
    );

    vinculo = await BD.queryOne(
      `SELECT vpp.*, ev.nombre AS estado_vinculo
       FROM vinculos_profesional_pertenecientes vpp
       LEFT JOIN estados_vinculos ev ON ev.id = vpp.id_estado_vinculo
       WHERE vpp.id_profesional = $1
         AND vpp.id_perteneciente = $2`,
      [profesional.id, perteneciente.id],
    );
  }

  const chatService = new ChatService();
  const mensajeService = new MensajeService();

  const chatResult = await chatService.createProfesionalPertenecienteAsync({
    id_usuario_profesional: profesionalUserId,
    id_perteneciente: perteneciente.id,
    id_tipo_chat: tipoChatId,
    nombre: `Test profesional ${profesionalUserId} - perteneciente ${pertenecienteUserId}`,
  });

  const mensaje = await mensajeService.createFromUserAsync({
    id_chat: chatResult.chat.id,
    id_usuario_emisor: profesionalUserId,
    id_tipo_mensaje: tipoMensajeId,
    contenido: `Mensaje de prueba backend ${new Date().toISOString()}`,
    fecha_envio: new Date(),
  });

  console.log(JSON.stringify({
    ok: true,
    inputs: {
      profesionalUserId,
      pertenecienteUserId,
      tutorUserId,
      tipoChatId,
      tipoMensajeId,
      shouldApproveTutor,
    },
    resolved: {
      profesional,
      perteneciente,
      tutor,
      vinculo,
    },
    chat: chatResult,
    mensaje,
  }, null, 2));
}

try {
  await main();
} finally {
  await BD.pool.end();
}
