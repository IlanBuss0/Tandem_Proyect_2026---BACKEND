import AppError from '../modules/errors/AppError.js';
import { verifyJwt } from '../modules/security/jwt.helper.js';
import { ACCESS_COOKIE_NAME } from '../configs/auth-cookies.config.js';

export function authMiddleware(req, res, next) {
  const token = req.cookies?.[ACCESS_COOKIE_NAME];

  if (!token) {
    return next(new AppError('Token requerido', 401));
  }

  const payload = verifyJwt(token);

  if (!payload) {
    return next(new AppError('Token invalido', 401));
  }

  req.user = payload;
  return next();
}
