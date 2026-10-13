import './helpers/test-env.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'node:http';
import { CATALOG_ROUTE_PREFIXES, catalogCache, privateNoCache } from '../src/middlewares/cache-control.middleware.js';

async function withApp(configure, run) {
  const app = express();
  configure(app);
  const server = await new Promise((resolve) => { const s = app.listen(0, () => resolve(s)); });
  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

function configure(app) {
  app.use('/api', privateNoCache);
  app.use(CATALOG_ROUTE_PREFIXES, catalogCache());
  app.get('/api/pertenecientes', (req, res) => res.json([{ id: 1 }]));
  app.get('/api/niveles-apoyos', (req, res) => res.json([{ id: 1, nombre: 'Nivel 1' }]));
  app.get('/api/public/tarjeta/x', (req, res) => { res.set('Cache-Control', 'no-store'); res.json({ ok: true }); });
  app.post('/api/pertenecientes', (req, res) => res.json({ ok: true }));
}

test('datos personales: private, no-cache + ETag y 304 si no cambio', async () => {
  await withApp(configure, async (base) => {
    const first = await fetch(`${base}/api/pertenecientes`);
    assert.equal(first.headers.get('cache-control'), 'private, no-cache');
    const etag = first.headers.get('etag');
    assert.ok(etag);
    // http.request (no fetch): fetch agrega Cache-Control: no-cache al mandar
    // If-None-Match a mano; el navegador revalidando desde su cache no lo hace.
    const status = await new Promise((resolve, reject) => {
      http.get(`${base}/api/pertenecientes`, { headers: { 'If-None-Match': etag } }, (res) => {
        res.resume();
        resolve(res.statusCode);
      }).on('error', reject);
    });
    assert.equal(status, 304);
  });
});

test('catalogos globales: private, max-age=300', async () => {
  await withApp(configure, async (base) => {
    const response = await fetch(`${base}/api/niveles-apoyos`);
    assert.equal(response.headers.get('cache-control'), 'private, max-age=300');
  });
});

test('no-store de un handler se respeta y nunca se usa public', async () => {
  await withApp(configure, async (base) => {
    const response = await fetch(`${base}/api/public/tarjeta/x`);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    for (const path of ['/api/pertenecientes', '/api/niveles-apoyos']) {
      const r = await fetch(`${base}${path}`);
      assert.ok(!/public/i.test(r.headers.get('cache-control')));
    }
  });
});

test('las escrituras no reciben cabecera de cache', async () => {
  await withApp(configure, async (base) => {
    const response = await fetch(`${base}/api/pertenecientes`, { method: 'POST' });
    assert.equal(response.headers.get('cache-control'), null);
  });
});
