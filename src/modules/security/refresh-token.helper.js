import crypto from 'crypto';
import { envConfig } from '../../configs/env.config.js';
import { parseExpiresIn } from './jwt.helper.js';

export function generateRefreshToken() {
  return crypto.randomBytes(64).toString('base64url');
}

export function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function createSessionFamilyId() {
  return crypto.randomUUID();
}

export function getRefreshExpiresAt() {
  return new Date((Math.floor(Date.now() / 1000) + parseExpiresIn(envConfig.refreshTokenExpiresIn)) * 1000);
}
