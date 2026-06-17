import crypto from 'crypto';
import { envConfig } from '../../configs/env.config.js';

const secret = envConfig.jwtSecret || envConfig.jwt_secret;

function getSecret() {
  if (!secret) {
    throw new Error('JWT_SECRET no configurado');
  }

  return secret;
}

function b64url(data) {
  return Buffer.from(JSON.stringify(data)).toString('base64url');
}

function sign(data) {
  return crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
}

function timingSafeEqual(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function parseExpiresIn(value) {
  const match = String(value || '').trim().match(/^(\d+)([smhd])$/i);
  if (!match) return 2 * 60 * 60;

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1, m: 60, h: 60 * 60, d: 24 * 60 * 60 };

  return amount * multipliers[unit];
}

export function signJwt(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: now,
    exp: now + parseExpiresIn(envConfig.jwtExpiresIn),
  };
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
  if (!timingSafeEqual(expected, s)) return null;

  try {
    const payload = JSON.parse(Buffer.from(p, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);

    if (!payload.exp || payload.exp <= now) return null;

    return payload;
  } catch {
    return null;
  }
}
