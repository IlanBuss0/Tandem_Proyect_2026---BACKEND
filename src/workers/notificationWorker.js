import { Worker } from 'bullmq';
import { envConfig } from '../configs/env.config.js';
import { createRedisConnection, isRedisEnabled } from '../redis/redisClient.js';
import { notificationQueueName } from '../queues/notificationQueue.js';
import ChatNotificationJobService from '../services/ChatNotificationJobService.js';

let worker = null;

export function startNotificationWorker() {
  if (!isRedisEnabled()) {
    console.log('[Notifications] REDIS_URL no configurado; worker BullMQ desactivado.');
    return null;
  }

  if (worker) return worker;

  const jobService = new ChatNotificationJobService();
  worker = new Worker(
    notificationQueueName,
    async (job) => jobService.processMessageNotificationsAsync(job.data),
    {
      connection: createRedisConnection('notification-worker'),
      concurrency: envConfig.notificationWorkerConcurrency,
    },
  );

  worker.on('completed', (job, result) => {
    console.log(`[Notifications] Job ${job.id} completado`, result);
  });

  worker.on('failed', (job, error) => {
    console.error(`[Notifications] Job ${job?.id} fallo:`, error.message);
  });

  console.log('[Notifications] Worker BullMQ iniciado.');
  return worker;
}
