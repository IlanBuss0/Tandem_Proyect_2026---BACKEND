import { Emitter } from '@socket.io/redis-emitter';
import { chatRoom, userRoom } from './rooms.js';
import { connectRedisClient, createRedisConnection, isRedisEnabled } from '../redis/redisClient.js';

let ioInstance = null;
let redisEmitterPromise = null;

export function setRealtimeServer(io) {
  ioInstance = io;
}

export function getRealtimeServer() {
  return ioInstance;
}

export function emitToUser(idUsuario, eventName, payload) {
  if (!idUsuario) return;
  emitToRoom(userRoom(idUsuario), eventName, payload);
}

export function emitToChat(idChat, eventName, payload) {
  if (!idChat) return;
  emitToRoom(chatRoom(idChat), eventName, payload);
}

async function getRedisEmitter() {
  if (!isRedisEnabled()) return null;

  if (!redisEmitterPromise) {
    redisEmitterPromise = (async () => {
      const redisClient = createRedisConnection('socket-io-emitter');
      const connected = await connectRedisClient(redisClient, 'socket-io-emitter');
      if (!connected) return null;
      return new Emitter(redisClient);
    })();
  }

  return await redisEmitterPromise;
}

function emitToRoom(room, eventName, payload) {
  if (ioInstance) {
    ioInstance.to(room).emit(eventName, payload);
    return;
  }

  getRedisEmitter()
    .then((emitter) => {
      if (emitter) emitter.to(room).emit(eventName, payload);
    })
    .catch((error) => console.error('[Socket.io] Error emitiendo por Redis:', error.message));
}
