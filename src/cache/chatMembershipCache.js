import { getSharedRedisClient, isRedisEnabled } from '../redis/redisClient.js';

const ttlSeconds = 60 * 10;

function chatMembersKey(idChat) {
  return `chat:${idChat}:members`;
}

export async function isCachedChatMember(idChat, idUsuario) {
  if (!isRedisEnabled()) return null;

  const redis = await getSharedRedisClient('chat-members-cache');
  const exists = await redis.sismember(chatMembersKey(idChat), String(idUsuario));
  return exists === 1;
}

export async function addCachedChatMember(idChat, idUsuario) {
  if (!isRedisEnabled()) return;

  const redis = await getSharedRedisClient('chat-members-cache');
  const key = chatMembersKey(idChat);
  await redis.sadd(key, String(idUsuario));
  await redis.expire(key, ttlSeconds);
}

export async function removeCachedChatMember(idChat, idUsuario) {
  if (!isRedisEnabled()) return;

  const redis = await getSharedRedisClient('chat-members-cache');
  await redis.srem(chatMembersKey(idChat), String(idUsuario));
}

export async function hydrateCachedChatMembers(idChat, participantes) {
  if (!isRedisEnabled() || !Array.isArray(participantes)) return;

  const activeUserIds = participantes
    .filter((participante) => !participante.fecha_salida)
    .map((participante) => String(participante.id_usuario));

  if (activeUserIds.length === 0) return;

  const redis = await getSharedRedisClient('chat-members-cache');
  const key = chatMembersKey(idChat);
  await redis.sadd(key, activeUserIds);
  await redis.expire(key, ttlSeconds);
}
