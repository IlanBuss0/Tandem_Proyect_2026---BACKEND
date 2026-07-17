import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import ResenaProfesionalService from '../services/ResenaProfesionalService.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const currentService = new ResenaProfesionalService();
router.use(authMiddleware);

router.get('', async (req, res, next) => {
  try {
    const r = await currentService.getAllAsync();
    res.status(StatusCodes.OK).json(r);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const r = await currentService.getByIdAsync(id);
    if (r != null) res.status(StatusCodes.OK).json(r);
    else res.status(StatusCodes.NOT_FOUND).send('No encontrado.');
  } catch (error) {
    next(error);
  }
});

router.post('', async (req, res, next) => {
  try {
    const { id_profesional, puntaje, comentario } = req.body || {};
    const newId = await currentService.createMineAsync(req.user.id, { id_profesional, puntaje, comentario });
    res.status(StatusCodes.CREATED).json({ id: newId });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { puntaje, comentario } = req.body || {};
    const rowsAffected = await currentService.updateMineAsync(req.user.id, id, { puntaje, comentario });
    if (rowsAffected !== 0) res.status(StatusCodes.OK).json({ rowsAffected });
    else res.status(StatusCodes.NOT_FOUND).send('No encontrado.');
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const rowCount = await currentService.deleteMineAsync(req.user.id, id);
    if (rowCount !== 0) res.status(StatusCodes.OK).json({ rowsAffected: rowCount });
    else res.status(StatusCodes.NOT_FOUND).send('No encontrado.');
  } catch (error) {
    next(error);
  }
});

export default router;
