import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import AppError from '../modules/errors/AppError.js';

// TEMPORAL: borrar despues de verificar en produccion que `ip` es la del
// visitante (y no la de Vercel ni la de Railway). Solo admin con sesion; se
// monta despues de authMiddleware. No guarda ni loguea nada.
const ADMIN_USER_TYPE = 4;

const router = Router();

router.get('', (req, res, next) => {
  if (Number(req.account?.id_tipo_usuario) !== ADMIN_USER_TYPE) {
    return next(new AppError('Solo administradores.', StatusCodes.FORBIDDEN));
  }
  res.status(StatusCodes.OK).json({ ip: req.ip, ips: req.ips });
});

export default router;
