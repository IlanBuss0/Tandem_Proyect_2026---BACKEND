import crypto from 'crypto';
import { envConfig } from '../../configs/env.config.js';

const secret = envConfig.jwtSecret || envConfig.jwt_secret || 'tandem-dev-secret';

function b64url(data) {
  return Buffer.from(JSON.stringify(data)).toString('base64url');
}

function sign(data) {
  return crypto.createHmac('sha256', secret).update(data).digest('base64url');
}

export function signJwt(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const body = { ...payload, iat: Math.floor(Date.now() / 1000) };
  const encodedHeader = b64url(header);
  const encodedBody = b64url(body);
  const tokenBody = `${encodedHeader}.${encodedBody}`;
  return `${tokenBody}.${sign(tokenBody)}`;
}

export function verifyJwt(token) {
  const [h, p, s] = token.split('.');
  if (!h || !p || !s) return null;
  const tokenBody = `${h}.${p}`;
  const expected = sign(tokenBody);
  if (expected !== s) return null;
  return JSON.parse(Buffer.from(p, 'base64url').toString('utf8'));
}
