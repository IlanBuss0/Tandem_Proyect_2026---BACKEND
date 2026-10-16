import AppError from '../modules/errors/AppError.js';
import { verifyJwt } from '../modules/security/jwt.helper.js';
import { ACCESS_COOKIE_NAME } from '../configs/auth-cookies.config.js';
import AuthRepository from '../repositories/AuthRepository.js';
import RefreshTokenRepository from '../repositories/RefreshTokenRepository.js';
import { getCachedAccount } from '../cache/accountCache.js';

export async function authenticateSessionToken(token, { fresh = false } = {}) {
  const payload = token ? verifyJwt(token) : null;
  if (!payload?.id) throw new AppError('Token invalido', 401);
  const account = fresh ? await AuthRepository.findSafeById(payload.id) : await getCachedAccount(payload.id, () => AuthRepository.findSafeById(payload.id));
  if (!account?.activo) throw new AppError('Cuenta no disponible', 401);
  if (!(await RefreshTokenRepository.isFamilyActive(payload.id, payload.sid))) throw new AppError('Sesion vencida o revocada', 401);
  return { payload, account };
}

export async function authMiddleware(req, res, next) {
  const token = req.cookies?.[ACCESS_COOKIE_NAME];

  if (!token) {
    return next(new AppError('Token requerido', 401));
  }

  // Varios routers vuelven a montar authMiddleware despues del global de
  // /api: si este mismo token ya se valido en este pedido, no repetir el
  // trabajo (ni la consulta a la base).
  if (req.user && req.account && req.authToken === token) {
    return next();
  }

  try {
    const { payload, account } = await authenticateSessionToken(token);
    req.user = payload;
    req.account = account;
    req.authToken = token;
    return next();
  } catch (error) {
    return next(error);
  }
}

export function verifiedAccountMiddleware(req, res, next) {
  if (!req.account?.email_verificado) return next(new AppError('Verifica tu correo para continuar', 403, 'EMAIL_NOT_VERIFIED'));
  return next();
}
