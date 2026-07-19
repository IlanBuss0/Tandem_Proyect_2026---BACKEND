import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import ReporteProfesionalService from '../services/ReporteProfesionalService.js';
import TareaReporteProgramadoService from '../services/TareaReporteProgramadoService.js';
import ReportePdfService from '../services/ReportePdfService.js';
import AuthorizationService from '../services/AuthorizationService.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { reporteProfesionalCreateRateLimiter } from '../middlewares/rate-limit.middleware.js';

const router = Router();
const reporteService = new ReporteProfesionalService();
const tareaService = new TareaReporteProgramadoService();
const pdfService = new ReportePdfService();
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

async function tutorContext(req) {
  const context = await AuthorizationService.getUserContext(req.user.id);
  if (!context?.tutor?.id) {
    const error = new Error('Se requiere una cuenta de tutor.');
    error.statusCode = 403;
    throw error;
  }
  return context;
}

router.post('', reporteProfesionalCreateRateLimiter, async (req, res) => {
  try {
    const context = await professionalContext(req);
    const reporte = await reporteService.generateOnDemandAsync(req.user.id, context.profesional.id, req.body);
    return res.status(StatusCodes.CREATED).json(reporte);
  } catch (error) {
    return sendError(res, error, StatusCodes.BAD_REQUEST);
  }
});

router.get('', async (req, res) => {
  try {
    const context = await professionalContext(req);
    const idPerteneciente = req.query.id_perteneciente ? Number(req.query.id_perteneciente) : null;
    const reportes = await reporteService.getByProfesionalIdAsync(context.profesional.id, idPerteneciente);
    return res.status(StatusCodes.OK).json(reportes);
  } catch (error) {
    return sendError(res, error, StatusCodes.BAD_REQUEST);
  }
});

router.get('/tutor', async (req, res) => {
  try {
    await tutorContext(req);
    const reportes = await reporteService.getForTutorAsync(req.user.id);
    return res.status(StatusCodes.OK).json(reportes);
  } catch (error) {
    return sendError(res, error, StatusCodes.BAD_REQUEST);
  }
});

router.get('/pdf-mensual', async (req, res) => {
  try {
    const context = await professionalContext(req);
    const anio = Number(req.query.anio);
    const mes = Number(req.query.mes);
    if (!anio || !mes || mes < 1 || mes > 12) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'anio y mes son obligatorios (mes entre 1 y 12).' });
    }
    const data = await reporteService.generateMonthlyPdfDataAsync(context.profesional.id, req.user.id, anio, mes);
    await pdfService.streamCaseloadPdfAsync(res, data);
  } catch (error) {
    return sendError(res, error, StatusCodes.BAD_REQUEST);
  }
});

router.post('/:id/send', async (req, res) => {
  try {
    const context = await professionalContext(req);
    const reporte = await reporteService.sendToTutorAsync(Number(req.params.id), req.user.id, context.profesional.id);
    return res.status(StatusCodes.OK).json(reporte);
  } catch (error) {
    return sendError(res, error, StatusCodes.BAD_REQUEST);
  }
});

router.get('/tareas-programadas', async (req, res) => {
  try {
    const context = await professionalContext(req);
    const tareas = await tareaService.getByProfesionalIdAsync(context.profesional.id);
    return res.status(StatusCodes.OK).json(tareas);
  } catch (error) {
    return sendError(res, error, StatusCodes.BAD_REQUEST);
  }
});

router.put('/tareas-programadas', async (req, res) => {
  try {
    const context = await professionalContext(req);
    await reporteService.assertVinculoActivoAsync(context.profesional.id, Number(req.body?.id_perteneciente));
    const tarea = await tareaService.upsertAsync(context.profesional.id, req.body);
    return res.status(StatusCodes.OK).json(tarea);
  } catch (error) {
    return sendError(res, error, StatusCodes.BAD_REQUEST);
  }
});

router.delete('/tareas-programadas/:id', async (req, res) => {
  try {
    const context = await professionalContext(req);
    const rowsAffected = await tareaService.deactivateAsync(Number(req.params.id), context.profesional.id);
    return res.status(StatusCodes.OK).json({ rowsAffected });
  } catch (error) {
    return sendError(res, error, StatusCodes.BAD_REQUEST);
  }
});

export default router;
