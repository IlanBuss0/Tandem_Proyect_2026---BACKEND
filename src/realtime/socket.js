import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { verifyJwt } from '../modules/security/jwt.helper.js';
import MensajeService from '../services/MensajeService.js';
import ParticipanteChatService from '../services/ParticipanteChatService.js';
import { chatRoom, userRoom } from './rooms.js';
import { setRealtimeServer } from './realtime.js';
import { connectRedisClient, createRedisConnection, isRedisEnabled } from '../redis/redisClient.js';

const mensajeService = new MensajeService();
const participanteChatService = new ParticipanteChatService();

function getTokenFromSocket(socket) {
  const authToken = socket.handshake.auth?.token;
  if (authToken) return authToken;

  const authorization = socket.handshake.headers?.authorization;
  if (!authorization) return null;

  const [type, token] = authorization.split(' ');
  return type === 'Bearer' ? token : null;
}

function parsePositiveInt(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function ack(callback, response) {
  if (typeof callback === 'function') callback(response);
}

export async function setupRealtime(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: false,
    },
  });

  setRealtimeServer(io);

  if (isRedisEnabled()) {
    const pubClient = createRedisConnection('socket-io-pub');
    const subClient = createRedisConnection('socket-io-sub');
    await Promise.all([
      connectRedisClient(pubClient, 'socket-io-pub'),
      connectRedisClient(subClient, 'socket-io-sub'),
    ]);
    io.adapter(createAdapter(pubClient, subClient));
    console.log('[Socket.io] Redis adapter activado.');
  } else {
    console.log('[Socket.io] Redis adapter desactivado; REDIS_URL no configurado.');
  }

  io.use((socket, next) => {
    const token = getTokenFromSocket(socket);
    const payload = token ? verifyJwt(token) : null;

    if (!payload?.id) {
      return next(new Error('Token invalido'));
    }

    socket.data.user = payload;
    return next();
  });

  io.on('connection', (socket) => {
    const idUsuario = socket.data.user.id;
    socket.join(userRoom(idUsuario));
    console.log(`[Socket.io] usuario conectado user:${idUsuario} socket:${socket.id}`);

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.io] usuario desconectado user:${idUsuario} socket:${socket.id} reason:${reason}`);
    });

    socket.on('chat:join', async ({ id_chat }, callback) => {
      try {
        const idChat = parsePositiveInt(id_chat);
        if (!idChat) throw new Error('id_chat invalido.');

        await participanteChatService.ensureActiveParticipantAsync(idChat, idUsuario);
        socket.join(chatRoom(idChat));
        console.log(`[Socket.io] chat:join OK user:${idUsuario} chat:${idChat} socket:${socket.id}`);

        ack(callback, { ok: true, data: { id_chat: idChat } });
      } catch (error) {
        console.log(`[Socket.io] chat:join ERROR user:${idUsuario} chat:${id_chat} error:${error.message}`);
        ack(callback, { ok: false, error: error.message });
      }
    });

    socket.on('chat:leave', ({ id_chat }, callback) => {
      const idChat = parsePositiveInt(id_chat);
      if (idChat) socket.leave(chatRoom(idChat));

      ack(callback, { ok: true, data: { id_chat: idChat } });
    });

    socket.on('message:send', async (payload, callback) => {
      try {
        const idChat = parsePositiveInt(payload?.id_chat);
        const idTipoMensaje = parsePositiveInt(payload?.id_tipo_mensaje) || 1;

        if (!idChat) throw new Error('id_chat invalido.');

        const message = await mensajeService.createFromUserAsync({
          id_chat: idChat,
          id_usuario_emisor: idUsuario,
          id_tipo_mensaje: idTipoMensaje,
          contenido: payload?.contenido ?? null,
          fecha_envio: payload?.fecha_envio ?? new Date(),
        });

        io.to(chatRoom(idChat)).emit('message:new', message);
        const participantes = await participanteChatService.getByChatIdAsync(idChat);
        console.log(`[Socket.io] message:new chat:${idChat} message:${message.id} participantes:${participantes.length}`);
        participantes
          .filter((participante) => !participante.fecha_salida)
          .forEach((participante) => {
            io.to(userRoom(participante.id_usuario)).emit('message:new', message);
          });
        ack(callback, { ok: true, data: message });
      } catch (error) {
        ack(callback, { ok: false, error: error.message });
      }
    });

    socket.on('message:typing', async (payload, callback) => {
      try {
        const idChat = parsePositiveInt(payload?.id_chat);
        if (!idChat) throw new Error('id_chat invalido.');

        await participanteChatService.ensureActiveParticipantAsync(idChat, idUsuario);
        socket.to(chatRoom(idChat)).emit('message:typing', {
          id_chat: idChat,
          id_usuario: idUsuario,
          escribiendo: Boolean(payload?.escribiendo),
        });

        ack(callback, { ok: true });
      } catch (error) {
        ack(callback, { ok: false, error: error.message });
      }
    });
  });

  return io;
}
