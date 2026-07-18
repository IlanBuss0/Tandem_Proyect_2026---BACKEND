import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import PerfilProfesionalService from '../services/PerfilProfesionalService.js';
import ProfesionalService from '../services/ProfesionalService.js';
import AuthorizationService from '../services/AuthorizationService.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const service = new PerfilProfesionalService();
const profesionalService = new ProfesionalService();
router.use(authMiddleware);

function sendError(res, error, fallback = 500) {
  return res.status(Number(error?.statusCode || fallback)).json({ error: error?.message || 'Error interno.' });
}

router.get('/directory', async (req, res) => {
  try {
    const context = await AuthorizationService.getUserContext(req.user.id);
    if (!context?.tutor && !context?.perteneciente) {
      return res.status(StatusCodes.FORBIDDEN).json({ error: 'El directorio esta disponible para tutores y pertenecientes.' });
    }
    return res.status(StatusCodes.OK).json(await service.getDirectoryAsync());
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/mine', async (req, res) => {
  try {
    const context = await AuthorizationService.getUserContext(req.user.id);
    if (!context?.profesional?.id) return res.status(403).json({ error: 'Se requiere una cuenta profesional.' });
    const [profesional, profile] = await Promise.all([
      profesionalService.getMineAsync(req.user.id),
      service.getMineAsync(context.profesional.id),
    ]);
    return res.status(StatusCodes.OK).json({ profesional, perfil: profile });
  } catch (error) {
    return sendError(res, error);
  }
});

router.put('/mine', async (req, res) => {
  try {
    const context = await AuthorizationService.getUserContext(req.user.id);
    if (!context?.profesional?.id) return res.status(403).json({ error: 'Se requiere una cuenta profesional.' });
    const [profesional, profile] = await Promise.all([
      profesionalService.getMineAsync(req.user.id),
      service.saveMineAsync(context.profesional.id, req.body),
    ]);
    return res.status(StatusCodes.OK).json({ profesional, perfil: profile });
  } catch (error) {
    return sendError(res, error, 400);
  }
});

export default router;
