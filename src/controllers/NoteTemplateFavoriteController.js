import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import NoteTemplateFavoriteService from '../services/NoteTemplateFavoriteService.js';
import AuthorizationService from '../services/AuthorizationService.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const currentService = new NoteTemplateFavoriteService();
router.use(authMiddleware);

function sendError(res, error, fallback = StatusCodes.INTERNAL_SERVER_ERROR) {
  const status = Number(error?.statusCode || error?.status || fallback);
  return res.status(status).json({ error: error?.message || 'Error interno.' });
}

async function professionalContext(req) {
  const context = await AuthorizationService.getUserContext(req.user.id);
  if (!context?.profesional?.id) {
    const error = new Error('Se requiere una cuenta profesional.');
    error.statusCode = 403;
    throw error;
  }
  return context;
}

router.get('', async (req, res) => {
  try {
    const context = await professionalContext(req);
    const templateIds = await currentService.getByProfesionalIdAsync(context.profesional.id);
    return res.status(StatusCodes.OK).json(templateIds);
  } catch (error) {
    return sendError(res, error, StatusCodes.BAD_REQUEST);
  }
});

router.post('/:templateId', async (req, res) => {
  try {
    const context = await professionalContext(req);
    await currentService.addAsync(context.profesional.id, req.params.templateId);
    return res.status(StatusCodes.OK).json({ template_id: req.params.templateId });
  } catch (error) {
    return sendError(res, error, StatusCodes.BAD_REQUEST);
  }
});

router.delete('/:templateId', async (req, res) => {
  try {
    const context = await professionalContext(req);
    const rowsAffected = await currentService.removeAsync(context.profesional.id, req.params.templateId);
    return res.status(StatusCodes.OK).json({ rowsAffected });
  } catch (error) {
    return sendError(res, error, StatusCodes.BAD_REQUEST);
  }
});

export default router;
