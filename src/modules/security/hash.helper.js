import crypto from 'crypto';
import argon2 from 'argon2';

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export async function hashValue(value) {
  if (typeof value !== 'string' || !value.length) return value;
  if (value.startsWith('$argon2')) return value;
  if (value.startsWith('sha256$')) return value;
  return argon2.hash(value, { type: argon2.argon2id });
}

export async function compareValue(raw, hashed) {
  if (!hashed || typeof hashed !== 'string') return false;
  if (hashed.startsWith('$argon2')) return argon2.verify(hashed, raw);
  if (!hashed.startsWith('sha256$')) return raw === hashed;
  const candidate = `sha256$${digest(raw)}`;
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(hashed));
}

export function shouldRehashValue(hashed) {
  return typeof hashed === 'string' && !hashed.startsWith('$argon2');
}
