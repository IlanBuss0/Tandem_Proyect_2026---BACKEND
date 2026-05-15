import AppError from '../modules/errors/AppError.js';
import { verifyJwt } from '../modules/security/jwt.helper.js';

export function authMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) throw new AppError('No autenticado', 401);
    const payload = verifyJwt(token);
    if (!payload) throw new AppError('Token inválido', 401);
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
}
