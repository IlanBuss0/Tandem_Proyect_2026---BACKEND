import { chatRoom, userRoom } from './rooms.js';

let ioInstance = null;

export function setRealtimeServer(io) {
  ioInstance = io;
}

export function getRealtimeServer() {
  return ioInstance;
}

export function emitToUser(idUsuario, eventName, payload) {
  if (!ioInstance || !idUsuario) return;
  ioInstance.to(userRoom(idUsuario)).emit(eventName, payload);
}

export function emitToChat(idChat, eventName, payload) {
  if (!ioInstance || !idChat) return;
  ioInstance.to(chatRoom(idChat)).emit(eventName, payload);
}
