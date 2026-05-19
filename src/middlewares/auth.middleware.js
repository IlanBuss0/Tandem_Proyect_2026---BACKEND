import AppError from '../modules/errors/AppError.js';
import { verifyJwt } from '../modules/security/jwt.helper.js';

export function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return next(new AppError('Token requerido', 401));
  }

  const [type, token] = authorization.split(' ');

  if (type !== 'Bearer' || !token) {
    return next(new AppError('Token invalido', 401));
  }

  const payload = verifyJwt(token);

  if (!payload) {
    return next(new AppError('Token invalido', 401));
  }

  req.user = payload;
  return next();
}
