import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import TarjetaAyudaService from '../services/TarjetaAyudaService.js';
import AppError from '../modules/errors/AppError.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const currentService = new TarjetaAyudaService();

function parseIdPerteneciente(req) {
  const id = Number(req.params.idPerteneciente);
  if (!Number.isInteger(id) || id <= 0) throw new AppError('idPerteneciente invalido.', StatusCodes.BAD_REQUEST);
  return id;
}

// Rutas con sesion: el usuario sale siempre del JWT, nunca del body.
const router = Router();
router.use(authMiddleware);

router.get('/mia', async (req, res, next) => {
  try {
    res.status(StatusCodes.OK).json(await currentService.getMineAsync(req.user.id));
  } catch (error) {
    next(error);
  }
});

router.get('/perteneciente/:idPerteneciente', async (req, res, next) => {
  try {
    res.status(StatusCodes.OK).json(await currentService.getForTutorAsync(req.user.id, parseIdPerteneciente(req)));
  } catch (error) {
    next(error);
  }
});

router.put('/perteneciente/:idPerteneciente', async (req, res, next) => {
  try {
    res.status(StatusCodes.OK).json(await currentService.updateAsync(req.user.id, parseIdPerteneciente(req), req.body));
  } catch (error) {
    next(error);
  }
});

router.post('/perteneciente/:idPerteneciente/regenerar', async (req, res, next) => {
  try {
    res.status(StatusCodes.OK).json(await currentService.regenerateAsync(req.user.id, parseIdPerteneciente(req)));
  } catch (error) {
    next(error);
  }
});

// Ruta publica (sin cuenta): se monta ANTES de authMiddleware, con su rate limiter.
export const publicTarjetaAyudaRouter = Router();

publicTarjetaAyudaRouter.get('/:token', async (req, res, next) => {
  res.set({ 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' });
  try {
    res.status(StatusCodes.OK).json(await currentService.getPublicAsync(req.params.token));
  } catch (error) {
    next(error);
  }
});

export default router;
