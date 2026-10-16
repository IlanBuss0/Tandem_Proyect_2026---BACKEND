// Integration tests may only use an explicitly selected disposable local DB.
const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) throw new Error('TEST_DATABASE_URL is required for PostgreSQL integration tests.');
const target = new URL(databaseUrl);
if (!['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname) || !target.pathname.endsWith('_test')) {
  throw new Error('Integration tests require a local database whose name ends in _test.');
}
process.env.DATABASE_URL = databaseUrl;
process.env.JWT_SECRET = 'isolated-authorization-tests';
for (const key of ['FAL_KEY', 'GROQ_API_KEY', 'GEMINI_API_KEY', 'RESEND_API_KEY', 'REDIS_URL', 'SUPABASE_SERVICE_ROLE_KEY']) process.env[key] = '';
const { default: BD } = await import('../../src/db/BD.js');
if (new URL(BD.pool.options.connectionString).href !== target.href) throw new Error('Environment files must not override the test database.');
BD.pool.options.ssl = false;
const { envConfig } = await import('../../src/configs/env.config.js');
envConfig.redisUrl = null;
