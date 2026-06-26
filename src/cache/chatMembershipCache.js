import { cacheService } from '../services/CacheService.js';

const ttlSeconds = 600;
const cache = cacheService;

function chatMembersKey(idChat) {
  return `chat:${idChat}:members`;
}

export async function isCachedChatMember(idChat, idUsuario) {
  return await cache.sismember(chatMembersKey(idChat), String(idUsuario));
}

export async function addCachedChatMember(idChat, idUsuario) {
  const key = chatMembersKey(idChat);
  await cache.sadd(key, String(idUsuario));
  await cache.expire(key, ttlSeconds);
}

export async function removeCachedChatMember(idChat, idUsuario) {
  await cache.srem(chatMembersKey(idChat), String(idUsuario));
}

export async function hydrateCachedChatMembers(idChat, participantes) {
  if (!Array.isArray(participantes)) return;

  const activeUserIds = participantes
    .filter((participante) => !participante.fecha_salida)
    .map((participante) => String(participante.id_usuario));

  if (activeUserIds.length === 0) return;

  const key = chatMembersKey(idChat);
  await cache.sadd(key, activeUserIds);
  await cache.expire(key, ttlSeconds);
}
