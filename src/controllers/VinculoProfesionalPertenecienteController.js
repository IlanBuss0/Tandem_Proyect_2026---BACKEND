import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import VinculoProfesionalPertenecienteService from '../services/VinculoProfesionalPertenecienteService.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { inviteRateLimiter } from '../middlewares/rate-limit.middleware.js';
import { emitToUser } from '../realtime/realtime.js';
import AuthorizationService from '../services/AuthorizationService.js';

const router = Router();
const currentService = new VinculoProfesionalPertenecienteService();
router.use(authMiddleware);

router.get('', async (req, res, next) => {
  try {
    const r = await currentService.getForUserContextAsync(req.user.id);
    res.status(StatusCodes.OK).json(r);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const r = await currentService.getByIdForUserAsync(req.user.id, id);
    if (r != null) res.status(StatusCodes.OK).json(r);
    else res.status(StatusCodes.NOT_FOUND).send('No encontrado.');
  } catch (error) {
    next(error);
  }
});

router.post('/invite/generate', inviteRateLimiter, async (req, res, next) => {
  try {
    const data = await currentService.generateProfessionalInviteByTutorAsync({
      idUsuarioTutor: req.user.id,
      idPerteneciente: req.body?.id_perteneciente,
      horasValidez: req.body?.horas_validez ?? 1,
    });

    res.status(StatusCodes.CREATED).json({ ok: true, data });
  } catch (error) {
    next(error);
  }
});

router.post('/invite/join', inviteRateLimiter, async (req, res, next) => {
  try {
    const data = await currentService.joinProfessionalInviteAsync({
      idUsuarioProfesional: req.user.id,
      codigo: req.body?.codigo,
      token: req.body?.token,
    });

    if (data.id_usuario_tutor) {
      emitToUser(data.id_usuario_tutor, 'vinculo:professional-created', {
        id_vinculo: data.vinculo.id,
        id_profesional: data.vinculo.id_profesional,
        id_perteneciente: data.vinculo.id_perteneciente,
      });
    }

    if (data.id_usuario_perteneciente) {
      emitToUser(data.id_usuario_perteneciente, 'vinculo:professional-created', {
        id_vinculo: data.vinculo.id,
        id_profesional: data.vinculo.id_profesional,
        id_perteneciente: data.vinculo.id_perteneciente,
      });
    }

    await AuthorizationService.invalidateAllForUser();
    res.status(StatusCodes.OK).json({ ok: true, data });
  } catch (error) {
    next(error);
  }
});

router.delete('/tutor/:id', async (req, res, next) => {
  try {
    const data = await currentService.deleteByTutorAsync({
      idUsuarioTutor: req.user.id,
      idVinculo: req.params.id,
    });

    if (data.id_usuario_perteneciente) {
      emitToUser(data.id_usuario_perteneciente, 'vinculo:professional-deleted', {
        id_vinculo: data.vinculo.id,
        id_profesional: data.vinculo.id_profesional,
        id_perteneciente: data.vinculo.id_perteneciente,
      });
    }

    await AuthorizationService.invalidateAllForUser();
    res.status(StatusCodes.OK).json({ ok: true, data });
  } catch (error) {
    next(error);
  }
});

export default router;
