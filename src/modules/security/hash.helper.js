import crypto from 'crypto';

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export async function hashValue(value) {
  if (typeof value !== 'string' || !value.length) return value;
  if (value.startsWith('sha256$')) return value;
  return `sha256$${digest(value)}`;
}

export async function compareValue(raw, hashed) {
  if (!hashed || typeof hashed !== 'string') return false;
  if (!hashed.startsWith('sha256$')) return raw === hashed;
  const candidate = `sha256$${digest(raw)}`;
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(hashed));
}
