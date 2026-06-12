import { Router } from 'express';
import InviteVinculoService from '../services/InviteVinculoService.js';
import AuthorizationRepository from '../repositories/AuthorizationRepository.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { emitToUser } from '../realtime/realtime.js';

const router = Router();
const inviteService = new InviteVinculoService();

router.use(authMiddleware);

router.post('/generate', async (req, res, next) => {
  try {
    const tutor = await AuthorizationRepository.getTutorByUsuarioId(req.user.id);
    if (!tutor) {
      return res.status(403).json({ ok: false, error: 'Solo un tutor puede generar invitaciones' });
    }

    const horasValidez = req.body?.horas_validez ?? 1;
    const data = await inviteService.generateInviteAsync(tutor.id, horasValidez);

    res.status(201).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
});

router.post('/join', async (req, res, next) => {
  try {
    const { codigo, token } = req.body || {};

    if (!codigo && !token) {
      return res.status(400).json({ ok: false, error: 'Debe enviar codigo o token' });
    }

    const data = codigo
      ? await inviteService.joinViaCodigoAsync(req.user.id, codigo)
      : await inviteService.joinViaTokenAsync(req.user.id, token);

    const tutorData = await AuthorizationRepository.getTutorById(data.vinculo.id_tutor);
    if (tutorData?.id_usuario) {
      emitToUser(tutorData.id_usuario, 'vinculo:created', {
        id_vinculo: data.vinculo.id,
        id_perteneciente: data.vinculo.id_perteneciente,
        id_tutor: data.vinculo.id_tutor,
        es_principal: data.es_principal,
      });
    }

    res.status(200).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
});

router.get('/:token', async (req, res, next) => {
  try {
    const data = await inviteService.resolveTokenAsync(req.params.token);
    res.status(200).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
});

export default router;
