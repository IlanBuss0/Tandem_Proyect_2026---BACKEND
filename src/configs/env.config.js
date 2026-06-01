import dotenv from 'dotenv';
dotenv.config();

export const envConfig = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'tandem-dev-secret',
  redisUrl: process.env.REDIS_URL || null,
  arasaacApiBaseUrl: process.env.ARASAAC_API_BASE_URL || 'https://api.arasaac.org/api',
  arasaacStaticUrl: process.env.ARASAAC_STATIC_URL || 'https://static.arasaac.org/pictograms',
  notificationWorkerConcurrency: Number.parseInt(process.env.NOTIFICATION_WORKER_CONCURRENCY || '5', 10),
  startNotificationWorker: process.env.START_NOTIFICATION_WORKER !== 'false',
};
