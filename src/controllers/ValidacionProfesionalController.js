import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import ValidacionProfesionalService from '../services/ValidacionProfesionalService.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const currentService = new ValidacionProfesionalService();
router.use(authMiddleware);

function sendError(res, error, fallback = StatusCodes.INTERNAL_SERVER_ERROR) {
  const status = Number(error?.statusCode || error?.status || fallback);
  return res.status(status).json({ error: error?.message || 'Error interno.' });
}

router.get('/mine', async (req, res) => {
  try {
    const r = await currentService.getMineAsync(req.user.id);
    res.status(StatusCodes.OK).json(r ?? []);
  } catch (error) {
    sendError(res, error, StatusCodes.BAD_REQUEST);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const r = await currentService.getByIdForUserAsync(req.user.id, id);
    if (r != null) res.status(StatusCodes.OK).json(r);
    else res.status(StatusCodes.NOT_FOUND).send('No encontrado.');
  } catch (error) {
    sendError(res, error, StatusCodes.BAD_REQUEST);
  }
});

router.post('', async (req, res) => {
  try {
    const { numero_matricula, titulo_profesional, documento_dni_url } = req.body || {};
    const newId = await currentService.createMineAsync(req.user.id, { numero_matricula, titulo_profesional, documento_dni_url });
    res.status(StatusCodes.CREATED).json({ id: newId });
  } catch (error) {
    sendError(res, error, StatusCodes.BAD_REQUEST);
  }
});

export default router;
