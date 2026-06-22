import crypto from 'crypto';
import AppError from '../modules/errors/AppError.js';
import { CSRF_COOKIE_NAME } from '../configs/auth-cookies.config.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function timingSafeStringEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ''));
  const rightBuffer = Buffer.from(String(right || ''));

  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function csrfMiddleware(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.get('x-csrf-token');

  if (!cookieToken || !headerToken || !timingSafeStringEqual(cookieToken, headerToken)) {
    return next(new AppError('CSRF token invalido', 403));
  }

  return next();
}
