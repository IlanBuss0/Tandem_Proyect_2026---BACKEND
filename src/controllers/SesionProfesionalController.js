import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import SesionProfesionalService from '../services/SesionProfesionalService.js';
import SesionProfesional from '../entities/SesionProfesional.js';
import AuthorizationService from '../services/AuthorizationService.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { sesionProfesionalCreateRateLimiter } from '../middlewares/rate-limit.middleware.js';
import { AUTH_ACTIONS, PROFESIONAL_PERMISSIONS } from '../modules/security/permissions.constants.js';

const router = Router();
const currentService = new SesionProfesionalService();
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
    const context = await AuthorizationService.getUserContext(req.user.id);
    const idPerteneciente = Number(req.query.id_perteneciente);
    if (context?.profesional?.id) {
      const rows = await currentService.getByProfesionalIdAsync(context.profesional.id);
      return res.status(StatusCodes.OK).json(idPerteneciente
        ? rows.filter(row => Number(row.id_perteneciente) === idPerteneciente)
        : rows);
    }
    if (idPerteneciente) {
      await AuthorizationService.assertCanReadPertenecienteResource(
        req.user.id, idPerteneciente, PROFESIONAL_PERMISSIONS.VER_HISTORIAL,
      );
      return res.status(StatusCodes.OK).json(await currentService.getByPertenecienteIdAsync(idPerteneciente));
    }
    if (context?.perteneciente?.id) {
      return res.status(StatusCodes.OK).json(await currentService.getByPertenecienteIdAsync(context.perteneciente.id));
    }
    return res.status(StatusCodes.FORBIDDEN).json({ error: 'No autorizado para listar sesiones profesionales.' });
  } catch (error) {
    return sendError(res, error, StatusCodes.BAD_REQUEST);
  }
});

// Registrada antes de "/:id" a proposito: si no, Express matchea "series"
// como si fuera un :id numerico.
router.put('/series/:groupId', sesionProfesionalCreateRateLimiter, async (req, res) => {
  try {
    const context = await professionalContext(req);
    const { titulo, count, markPastAsCompleted } = req.body || {};
    const result = await currentService.resizeSeriesAsync(
      req.params.groupId,
      context.profesional.id,
      {
        titulo,
        count: count === undefined ? undefined : Number(count),
        markPastAsCompleted: Boolean(markPastAsCompleted),
      },
    );
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return sendError(res, error, StatusCodes.BAD_REQUEST);
  }
});

router.get('/:id/private-note', async (req, res) => {
  try {
    const context = await professionalContext(req);
    const note = await currentService.getPrivateNoteAsync(Number(req.params.id), context.profesional.id);
    return note
      ? res.status(StatusCodes.OK).json(note)
      : res.status(StatusCodes.NOT_FOUND).json({ error: 'Nota privada no encontrada.' });
  } catch (error) {
    return sendError(res, error, StatusCodes.BAD_REQUEST);
  }
});

router.put('/:id/private-note', async (req, res) => {
  try {
    const context = await professionalContext(req);
    const note = await currentService.savePrivateNoteAsync(
      Number(req.params.id), context.profesional.id, req.body?.contenido,
    );
    return note
      ? res.status(StatusCodes.OK).json(note)
      : res.status(StatusCodes.NOT_FOUND).json({ error: 'Sesion no encontrada.' });
  } catch (error) {
    return sendError(res, error, StatusCodes.BAD_REQUEST);
  }
});

router.put('/:id/private-note/drive', async (req, res) => {
  try {
    const context = await professionalContext(req);
    const document = await currentService.linkDriveDocumentAsync(
      Number(req.params.id), context.profesional.id, req.body,
    );
    return res.status(StatusCodes.OK).json(document);
  } catch (error) {
    return sendError(res, error, StatusCodes.BAD_REQUEST);
  }
});

router.delete('/:id/private-note/drive', async (req, res) => {
  try {
    const context = await professionalContext(req);
    const rowsAffected = await currentService.unlinkDriveDocumentAsync(
      Number(req.params.id), context.profesional.id,
    );
    return res.status(StatusCodes.OK).json({ rowsAffected });
  } catch (error) {
    return sendError(res, error, StatusCodes.BAD_REQUEST);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const session = await currentService.getByIdAsync(Number(req.params.id));
    if (!session) return res.status(StatusCodes.NOT_FOUND).json({ error: 'Sesion no encontrada.' });

    const context = await AuthorizationService.getUserContext(req.user.id);
    if (context?.profesional?.id) {
      // Un profesional solo puede leer sus propias sesiones, no las que
      // otro profesional agendo con el mismo paciente (mismo criterio que
      // PUT/DELETE). El vinculo aprobado con el paciente no alcanza aca.
      if (Number(session.id_profesional) !== Number(context.profesional.id)) {
        return res.status(StatusCodes.FORBIDDEN).json({ error: 'No autorizado para acceder a esta sesion.' });
      }
    } else {
      await AuthorizationService.assertCanReadPertenecienteResource(
        req.user.id, Number(session.id_perteneciente), PROFESIONAL_PERMISSIONS.VER_HISTORIAL,
      );
    }
    return res.status(StatusCodes.OK).json(session);
  } catch (error) {
    return sendError(res, error, StatusCodes.BAD_REQUEST);
  }
});

router.post('', sesionProfesionalCreateRateLimiter, async (req, res) => {
  try {
    const context = await professionalContext(req);
    const entity = new SesionProfesional({ ...req.body, id_profesional: context.profesional.id });
    await AuthorizationService.assertCan(req.user.id, AUTH_ACTIONS.PROFESIONAL_SESION_AGENDAR, {
      id_perteneciente: Number(entity.id_perteneciente),
    });
    const id = await currentService.createAsync(entity);
    return res.status(StatusCodes.CREATED).json({ id });
  } catch (error) {
    return sendError(res, error, StatusCodes.BAD_REQUEST);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const context = await professionalContext(req);
    const previous = await currentService.getByIdAsync(Number(req.params.id));
    if (!previous) return res.status(StatusCodes.NOT_FOUND).json({ error: 'Sesion no encontrada.' });
    if (Number(previous.id_profesional) !== Number(context.profesional.id)) {
      return res.status(StatusCodes.FORBIDDEN).json({ error: 'No autorizado para modificar esta sesion.' });
    }
    await AuthorizationService.assertCan(req.user.id, AUTH_ACTIONS.PROFESIONAL_SESION_AGENDAR, {
      id_perteneciente: Number(previous.id_perteneciente),
    });
    const entity = new SesionProfesional({
      ...req.body, id: previous.id, id_profesional: previous.id_profesional,
      id_perteneciente: previous.id_perteneciente,
      // La recurrencia solo se fija al crear la sesion (createRecurringAsync).
      // Un PUT nunca puede mover una sesion dentro o fuera de una serie, ni
      // reescribir su regla de repeticion.
      recurrence_group_id: previous.recurrence_group_id,
      recurrence_rule: previous.recurrence_rule,
      recurrence_index: previous.recurrence_index,
    });
    const rowsAffected = await currentService.updateAsync(entity);
    return res.status(StatusCodes.OK).json({ rowsAffected });
  } catch (error) {
    return sendError(res, error, StatusCodes.BAD_REQUEST);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const context = await professionalContext(req);
    const previous = await currentService.getByIdAsync(Number(req.params.id));
    if (!previous) return res.status(StatusCodes.NOT_FOUND).json({ error: 'Sesion no encontrada.' });
    if (Number(previous.id_profesional) !== Number(context.profesional.id)) {
      return res.status(StatusCodes.FORBIDDEN).json({ error: 'No autorizado para eliminar esta sesion.' });
    }
    const rowsAffected = await currentService.deleteByIdAsync(previous.id);
    return res.status(StatusCodes.OK).json({ rowsAffected });
  } catch (error) {
    return sendError(res, error, StatusCodes.BAD_REQUEST);
  }
});

export default router;
