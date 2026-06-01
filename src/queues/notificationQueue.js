import { Queue } from 'bullmq';
import { createRedisConnection, isRedisEnabled } from '../redis/redisClient.js';

export const notificationQueueName = 'notification-queue';

let notificationQueue = null;

export function getNotificationQueue() {
  if (!isRedisEnabled()) return null;

  if (!notificationQueue) {
    notificationQueue = new Queue(notificationQueueName, {
      connection: createRedisConnection('notification-queue'),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    });
  }

  return notificationQueue;
}

export async function enqueueChatMessageNotifications(payload) {
  const queue = getNotificationQueue();
  if (!queue) return false;

  await queue.add('processGroupNotifications', payload, {
    jobId: `message:${payload.messageId}`,
  });

  return true;
}
