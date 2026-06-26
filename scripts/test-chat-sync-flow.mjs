import BD from '../src/db/BD.js';
import ChatService from '../src/services/ChatService.js';
import MensajeService from '../src/services/MensajeService.js';

const args = new Map();

for (const arg of process.argv.slice(2)) {
  const [key, value] = arg.split('=');
  args.set(key, value ?? true);
}

const userId = Number(args.get('--user-id'));
const chatId = Number(args.get('--chat-id'));
const tipoMensajeId = Number(args.get('--tipo-mensaje-id') ?? 1);

function assertPositiveInt(value, name) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} debe ser un entero positivo.`);
  }
}

async function main() {
  assertPositiveInt(userId, '--user-id');
  assertPositiveInt(chatId, '--chat-id');
  assertPositiveInt(tipoMensajeId, '--tipo-mensaje-id');

  const chatService = new ChatService();
  const mensajeService = new MensajeService();

  const beforeSync = await chatService.syncByUsuarioIdAsync(userId, null);
  const message = await mensajeService.createFromUserAsync({
    id_chat: chatId,
    id_usuario_emisor: userId,
    id_tipo_mensaje: tipoMensajeId,
    contenido: `Mensaje sync test ${new Date().toISOString()}`,
    fecha_envio: new Date(),
  });
  const afterMessages = await mensajeService.getByChatForUserAsync(chatId, userId, 100, null, message.id - 1);
  const incrementalSync = await chatService.syncByUsuarioIdAsync(userId, beforeSync.serverTime);

  if (!afterMessages.some((item) => item.id === message.id)) {
    throw new Error(`afterId no devolvio el mensaje creado ${message.id}.`);
  }

  if (!incrementalSync.chats.some((chat) => chat.id === chatId)) {
    throw new Error(`sync incremental no devolvio el chat cambiado ${chatId}.`);
  }

  console.log(JSON.stringify({
    ok: true,
    userId,
    chatId,
    createdMessageId: message.id,
    afterMessages: afterMessages.map((item) => item.id),
    syncChatIds: incrementalSync.chats.map((chat) => chat.id),
  }, null, 2));
}

try {
  await main();
} finally {
  await BD.pool.end();
}
