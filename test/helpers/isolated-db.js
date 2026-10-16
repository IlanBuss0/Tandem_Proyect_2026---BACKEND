// Preloaded by test:authorization before any test module or app is evaluated.
process.env.JWT_SECRET = 'isolated-authorization-tests';
process.env.DATABASE_URL = 'postgresql://tests:tests@127.0.0.1:1/tests';
const { default: BD } = await import('../../src/db/BD.js');
const { envConfig } = await import('../../src/configs/env.config.js');
envConfig.redisUrl = null;
const blocked = async () => { throw new Error('Real database access is forbidden in authorization tests; mock the dependency.'); };
for (const method of ['query', 'queryOne', 'execute', 'transaction']) BD[method] = blocked;
BD.pool.query = blocked;
BD.pool.connect = blocked;
