import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import WebSocket from 'ws';
import { setupRealtime } from '../src/realtime/socket.js';
import AuthRepository from '../src/repositories/AuthRepository.js';
import RefreshTokenRepository from '../src/repositories/RefreshTokenRepository.js';
import { signJwt } from '../src/modules/security/jwt.helper.js';
import { envConfig } from '../src/configs/env.config.js';

test('socket handshake rejects missing, disabled, unverified and revoked accounts', async t => {
  const server = createServer();
  const io = await setupRealtime(server);
  t.mock.method(AuthRepository, 'findSafeById', async id => id === 1 ? null : { id, activo: id !== 2, email_verificado: id !== 3 });
  t.mock.method(RefreshTokenRepository, 'isFamilyActive', async (_id, sid) => sid === 'active');
  const handshake = (id, sid) => new Promise(resolve => io.sockets._fns[0]({ handshake: { headers: { cookie: `tandem_access_token=${signJwt({ id, sid })}` } }, data: {} }, resolve));
  try {
    for (const id of [1, 2, 3]) assert.ok(await handshake(id, 'active'));
    assert.ok(await handshake(4, 'revoked'));
    assert.equal(await handshake(4, 'active'), undefined);
  } finally { await new Promise(resolve => io.close(resolve)); }
});

test('an open socket disconnects when its JWT expires', async t => {
  t.mock.method(AuthRepository, 'findSafeById', async id => ({ id, activo: true, email_verificado: true }));
  t.mock.method(RefreshTokenRepository, 'isFamilyActive', async () => true);
  const server = createServer();
  const io = await setupRealtime(server);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const previous = envConfig.jwtExpiresIn;
  envConfig.jwtExpiresIn = '2s';
  const token = signJwt({ id: 1, sid: 'active' });
  envConfig.jwtExpiresIn = previous;
  const socket = new WebSocket(`ws://127.0.0.1:${server.address().port}/socket.io/?EIO=4&transport=websocket`, { headers: { Cookie: `tandem_access_token=${token}` } });
  let connected = false;
  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Socket did not expire')), 3500);
      socket.on('message', buffer => {
        const message = String(buffer);
        if (message.startsWith('0')) socket.send('40');
        if (message.startsWith('40')) connected = true;
        if (message === '41') { clearTimeout(timeout); resolve(); }
      });
      socket.on('error', reject);
    });
    assert.equal(connected, true);
  } finally { socket.terminate(); await new Promise(resolve => io.close(resolve)); }
});
