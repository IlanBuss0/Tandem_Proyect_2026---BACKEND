import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import AyudaService from '../services/AyudaService.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const currentService = new AyudaService();

router.use(authMiddleware);

function sendError(res, error, fallbackStatus = StatusCodes.INTERNAL_SERVER_ERROR) {
  res.status(error.statusCode ?? fallbackStatus).send(`Error: ${error.message}`);
}

// Aviso de ayuda del perteneciente desde una rutina o desde "No puedo hablar".
// El usuario sale siempre del JWT, nunca del body.
router.post('', async (req, res) => {
  try {
    const result = await currentService.requestAsync(req.user.id, {
      contexto: req.body?.contexto,
      motivo: req.body?.motivo,
      titulo: req.body?.titulo,
      paso: req.body?.paso,
      totalPasos: req.body?.totalPasos,
      pasoTexto: req.body?.pasoTexto,
      frase: req.body?.frase,
    });
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    sendError(res, error);
  }
});

export default router;
