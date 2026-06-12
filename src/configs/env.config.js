import dotenv from 'dotenv';
dotenv.config();

export const envConfig = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  databasePoolMax: Number.parseInt(process.env.DATABASE_POOL_MAX || '5', 10),
  jwtSecret: process.env.JWT_SECRET || 'tandem-dev-secret',
  redisUrl: process.env.REDIS_URL || null,
  arasaacApiBaseUrl: process.env.ARASAAC_API_BASE_URL || 'https://api.arasaac.org/api',
  arasaacStaticUrl: process.env.ARASAAC_STATIC_URL || 'https://static.arasaac.org/pictograms',
  supabaseUrl: process.env.SUPABASE_URL || null,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || null,
  supabaseAvatarBucket: process.env.SUPABASE_AVATAR_BUCKET || 'avatars',
  dicebearAvatarPngBaseUrl: process.env.DICEBEAR_AVATAR_PNG_BASE_URL || 'https://api.dicebear.com/9.x/avataaars/png',
  notificationWorkerConcurrency: Number.parseInt(process.env.NOTIFICATION_WORKER_CONCURRENCY || '5', 10),
  startNotificationWorker: process.env.START_NOTIFICATION_WORKER !== 'false',
};
