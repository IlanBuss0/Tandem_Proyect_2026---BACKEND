import { Redis } from 'ioredis';
import { envConfig } from '../configs/env.config.js';

const clients = new Map();

export function isRedisEnabled() {
  return Boolean(envConfig.redisUrl);
}

export function createRedisConnection(name = 'default') {
  if (!envConfig.redisUrl) return null;

  const client = new Redis(envConfig.redisUrl, {
    connectionName: `tandem:${name}`,
    lazyConnect: true,
    maxRetriesPerRequest: null,
    retryStrategy() {
      return null;
    },
    enableReadyCheck: false,
  });
  client.on('error', () => {});
  return client;
}

export async function connectRedisClient(client, name = 'redis') {
  if (!client || client.status === 'ready') return client;

  try {
    await client.connect();
    return client;
  } catch (error) {
    console.error(`[Redis] No se pudo conectar ${name}:`, error.message);
    return null;
  }
}

export async function getSharedRedisClient(name = 'shared') {
  if (!isRedisEnabled()) return null;

  if (!clients.has(name)) {
    clients.set(name, createRedisConnection(name));
  }

  return await connectRedisClient(clients.get(name), name);
}
