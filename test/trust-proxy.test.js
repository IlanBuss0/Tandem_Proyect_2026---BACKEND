import './helpers/test-env.js';
import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'node:http';
import express from 'express';
import { resolveTrustProxy } from '../src/configs/trust-proxy.config.js';
import DiagnosticoIpController from '../src/controllers/DiagnosticoIpController.js';
import { errorMiddleware } from '../src/middlewares/error.middleware.js';

// IP que ve Express para un pedido con X-Forwarded-For, segun `trust proxy`.
async function ipSeenBy(trustProxy, forwardedFor) {
  const app = express();
  app.set('trust proxy', trustProxy);
  app.get('/ip', (req, res) => res.json({ ip: req.ip }));
  const server = createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/ip`, { headers: { 'x-forwarded-for': forwardedFor } });
    return (await response.json()).ip;
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('con 2 proxies la IP real es la primera de X-Forwarded-For; con 1, la segunda; con false no usa el header', async () => {
  assert.equal(await ipSeenBy(2, '1.1.1.1, 2.2.2.2'), '1.1.1.1');
  assert.equal(await ipSeenBy(1, '1.1.1.1, 2.2.2.2'), '2.2.2.2');
  const ignored = await ipSeenBy(false, '1.1.1.1, 2.2.2.2');
  assert.ok(!ignored.includes('1.1.1.1') && !ignored.includes('2.2.2.2'), `uso el header: ${ignored}`);
});

test('resolveTrustProxy: TRUST_PROXY_HOPS definida manda; 0 es false', () => {
  assert.equal(resolveTrustProxy({ TRUST_PROXY_HOPS: '2', NODE_ENV: 'production' }), 2);
  assert.equal(resolveTrustProxy({ TRUST_PROXY_HOPS: '1' }), 1);
  assert.equal(resolveTrustProxy({ TRUST_PROXY_HOPS: '0', NODE_ENV: 'production' }), false);
  assert.equal(resolveTrustProxy({ TRUST_PROXY_HOPS: ' 2 ' }), 2);
});

test('resolveTrustProxy: sin definir, 1 en produccion y false en desarrollo', () => {
  assert.equal(resolveTrustProxy({ NODE_ENV: 'production' }), 1);
  assert.equal(resolveTrustProxy({ NODE_ENV: 'development' }), false);
  assert.equal(resolveTrustProxy({}), false);
  assert.equal(resolveTrustProxy({ TRUST_PROXY_HOPS: '', NODE_ENV: 'production' }), 1);
});

test('resolveTrustProxy: valor invalido avisa y usa el defecto; nunca devuelve true', () => {
  for (const bad of ['abc', '-1', '1.5', 'true', '2 proxies']) {
    const warnings = [];
    assert.equal(resolveTrustProxy({ TRUST_PROXY_HOPS: bad, NODE_ENV: 'production' }, (m) => warnings.push(m)), 1, bad);
    assert.equal(resolveTrustProxy({ TRUST_PROXY_HOPS: bad }, () => {}), false, bad);
    assert.equal(warnings.length, 1, `sin aviso para ${bad}`);
    assert.ok(!warnings[0].includes(bad), 'el aviso no debe repetir el valor recibido');
  }
  for (const value of ['0', '1', '2', '10', 'true', 'x', undefined]) {
    assert.notEqual(resolveTrustProxy({ TRUST_PROXY_HOPS: value, NODE_ENV: 'production' }, () => {}), true);
  }
});

test('diagnostico-ip: solo admin (tipo 4) ve la IP; cualquier otro, 403', async () => {
  async function call(account) {
    const app = express();
    app.set('trust proxy', 2);
    app.use((req, _res, next) => { req.account = account; next(); });
    app.use('/api/admin/diagnostico-ip', DiagnosticoIpController);
    app.use(errorMiddleware);
    const server = createServer(app);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    try {
      const response = await fetch(`http://127.0.0.1:${server.address().port}/api/admin/diagnostico-ip`, { headers: { 'x-forwarded-for': '1.1.1.1, 2.2.2.2' } });
      return { status: response.status, body: await response.json() };
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  }
  const admin = await call({ id: 1, id_tipo_usuario: 4 });
  assert.equal(admin.status, 200);
  assert.deepEqual(admin.body, { ip: '1.1.1.1', ips: ['1.1.1.1', '2.2.2.2'] });
  assert.equal((await call({ id: 2, id_tipo_usuario: 2 })).status, 403);
  assert.equal((await call(undefined)).status, 403);
});
