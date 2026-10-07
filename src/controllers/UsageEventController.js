import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import UsageEventService from '../services/UsageEventService.js';
import AuthorizationService from '../services/AuthorizationService.js';
import ConfiguracionUsuarioService from '../services/ConfiguracionUsuarioService.js';
import CalendarEventService from '../services/CalendarEventService.js';
import MemoryProfileService from '../services/MemoryProfileService.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { csrfMiddleware } from '../middlewares/csrf.middleware.js';
import { buildVocabularyReport } from '../modules/usage/vocabulary-report.js';
import { USAGE_EVENT_TYPES } from '../modules/usage/event-types.js';
import { parseEmotionsFromConfigs } from '../modules/usage/config-parsing.js';
import { detectEventTypePatterns, evaluateAnticipationSupport } from '../modules/usage/pattern-detection.js';
import { parseHelpDaysParam } from '../modules/usage/help-spots.js';
import { buildDailyEvolutionReport, buildEvolutionReport, parseDaysParam, parseWeeksParam } from '../modules/usage/evolution.js';

const router = Router();
const usageEventService = new UsageEventService();
const configuracionUsuarioService = new ConfiguracionUsuarioService();
const calendarEventService = new CalendarEventService();
const memoryProfileService = new MemoryProfileService();

// Registro de uso (Sesion 9): siempre se registra a nombre de QUIEN LLAMA
// (req.user.id) — un perteneciente registra su propio uso. No hay "en
// nombre de otro" aca (eso es lo que corrige el circuito de correccion de
// pictogramas, un mecanismo distinto). Acepta un evento o un array, para
// que el hook del frontend pueda mandar en lote sin logica extra.
router.post('', authMiddleware, csrfMiddleware, async (req, res, next) => {
  try {
    const body = req.body || {};
    const rawEvents = Array.isArray(body) ? body : Array.isArray(body.events) ? body.events : [body];
    const events = rawEvents.map((e) => ({
      idUsuario: req.user.id,
      tipoEvento: e.tipoEvento,
      entidadTipo: e.entidadTipo,
      entidadId: e.entidadId,
      idPictograma: e.idPictograma,
      valor: e.valor,
      origen: e.origen,
      ocurrioEn: e.ocurrioEn,
    }));

    const saved = await usageEventService.logManyAsync(events);
    res.status(StatusCodes.OK).json({ saved, total: events.length });
  } catch (error) {
    next(error);
  }
});

// Timeline de uso de un usuario (perteneciente): uno mismo, o su tutor/
// profesional con acceso. Reusa el mismo guard que configuraciones_usuarios
// (Sesion 6) — es exactamente la misma pregunta: "puede X leer datos del
// usuario Y".
router.get('/usuario/:idUsuario', authMiddleware, async (req, res, next) => {
  try {
    const idUsuario = parseInt(req.params.idUsuario, 10);
    await AuthorizationService.assertCanReadUsuarioConfig(req.user.id, idUsuario);

    const events = await usageEventService.getForUsuarioAsync(idUsuario, {
      tipoEvento: req.query.tipoEvento,
      limit: req.query.limit,
    });
    res.status(StatusCodes.OK).json(events);
  } catch (error) {
    res.status(error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

// Informe de vocabulario (Sesion 19, item 42): que palabras del nucleo
// (Sesion 11) uso esta persona en sus enunciados hablados, y cuales nunca
// uso. Mismo guard de lectura que el resto de los endpoints de usuario.
router.get('/usuario/:idUsuario/informe-vocabulario', authMiddleware, async (req, res, next) => {
  try {
    const idUsuario = parseInt(req.params.idUsuario, 10);
    await AuthorizationService.assertCanReadUsuarioConfig(req.user.id, idUsuario);

    const events = await usageEventService.getForUsuarioAsync(idUsuario, {
      tipoEvento: USAGE_EVENT_TYPES.ENUNCIADO_HABLADO,
      limit: 500,
    });
    res.status(StatusCodes.OK).json(buildVocabularyReport(events));
  } catch (error) {
    res.status(error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

// Deteccion de patrones (Sesion 20, item 41 ⭐) + que apoyos funcionan
// (item 43). Cruza calendario (tabla eventos_calendario, Sesion 24) y
// emociones (todavia en configuraciones_usuarios, sin migrar) con los
// eventos "se vio la historia social" (registrados desde SocialStoryView
// con tipoEvento 'pictograma_elegido' y entidadTipo 'historia_social',
// Sesion 15). Todo el calculo honesto (piso minimo de datos) vive en el
// modulo puro pattern-detection.js — aca solo se junta la data cruda.
router.get('/usuario/:idUsuario/patrones', authMiddleware, async (req, res, next) => {
  try {
    const idUsuario = parseInt(req.params.idUsuario, 10);
    await AuthorizationService.assertCanReadUsuarioConfig(req.user.id, idUsuario);

    const [calendarRows, configs, choiceEvents] = await Promise.all([
      calendarEventService.getForUsuarioAsync(idUsuario),
      configuracionUsuarioService.getByUsuarioIdAsync(idUsuario),
      usageEventService.getForUsuarioAsync(idUsuario, { tipoEvento: USAGE_EVENT_TYPES.PICTOGRAMA_ELEGIDO, limit: 1000 }),
    ]);

    const events = calendarRows.map((row) => ({ id: row.id, date: row.fecha, type: row.tipo }));
    const emotions = parseEmotionsFromConfigs(configs);
    const socialStoryViewedEventIds = new Set(
      (choiceEvents || [])
        .filter((e) => e.entidad_tipo === 'historia_social' && e.entidad_id)
        .map((e) => String(e.entidad_id)),
    );

    res.status(StatusCodes.OK).json({
      eventTypePatterns: detectEventTypePatterns(events, emotions),
      anticipationSupport: evaluateAnticipationSupport(events, emotions, socialStoryViewedEventIds),
    });
  } catch (error) {
    res.status(error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

// Pasos de rutina y emociones desde el inicio del dia (UTC) de hace `days - 1`
// dias, filtrados por fecha (no por las ultimas N filas) para que la ventana
// pedida entre completa.
function getEvolutionEvents(idUsuario, days) {
  const desde = new Date();
  desde.setUTCDate(desde.getUTCDate() - days + 1);
  desde.setUTCHours(0, 0, 0, 0);
  return usageEventService.getForUsuarioSinceAsync(idUsuario, {
    tipos: [USAGE_EVENT_TYPES.RUTINA_PASO_COMPLETADO, USAGE_EVENT_TYPES.EMOCION_REGISTRADA],
    desde: desde.toISOString(),
  });
}

// Evolucion en el tiempo (Sesion 21, item 44): pasos completados y animo
// semana a semana. Sin piso minimo (a diferencia de /patrones): esto
// describe lo que paso, no afirma una relacion causal. `semanas` (8, 13 o 52,
// Prompt 2 del selector de periodo) filtra por fecha en vez de traer las
// ultimas 200 filas de cualquier tipo de evento — con el limite fijo,
// 13 semanas de datos no entraban siempre en esas 200 filas.
router.get('/usuario/:idUsuario/evolucion', authMiddleware, async (req, res, next) => {
  try {
    const idUsuario = parseInt(req.params.idUsuario, 10);
    await AuthorizationService.assertCanReadUsuarioConfig(req.user.id, idUsuario);

    const weeks = parseWeeksParam(req.query.semanas);
    if (weeks === null) {
      return res.status(StatusCodes.BAD_REQUEST).send('Error: el parámetro semanas debe ser 8, 13 o 52.');
    }

    const events = await getEvolutionEvents(idUsuario, weeks * 7 + 1);
    res.status(StatusCodes.OK).json(buildEvolutionReport(events, { maxWeeks: weeks }));
  } catch (error) {
    res.status(error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

// Mismo dato que /evolucion pero por dia, para los periodos "Hoy" (dias=2) y
// "Ultima semana" (dias=14) del selector del frontend.
router.get('/usuario/:idUsuario/evolucion-diaria', authMiddleware, async (req, res, next) => {
  try {
    const idUsuario = parseInt(req.params.idUsuario, 10);
    await AuthorizationService.assertCanReadUsuarioConfig(req.user.id, idUsuario);

    const days = parseDaysParam(req.query.dias);
    if (days === null) {
      return res.status(StatusCodes.BAD_REQUEST).send('Error: el parámetro dias debe ser 2 o 14.');
    }

    const events = await getEvolutionEvents(idUsuario, days);
    res.status(StatusCodes.OK).json(buildDailyEvolutionReport(events, days));
  } catch (error) {
    res.status(error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

// "Donde se traba": pasos donde mas pidio ayuda en los ultimos `dias` (30 por
// defecto, hasta 90). Solo cuenta lo que paso. Mismo guard de lectura que el
// resto de los endpoints de usuario.
router.get('/usuario/:idUsuario/ayudas', authMiddleware, async (req, res, next) => {
  try {
    const idUsuario = parseInt(req.params.idUsuario, 10);
    await AuthorizationService.assertCanReadUsuarioConfig(req.user.id, idUsuario);

    const dias = parseHelpDaysParam(req.query.dias);
    if (dias === null) {
      return res.status(StatusCodes.BAD_REQUEST).send('Error: el parámetro dias debe ser un entero entre 1 y 90.');
    }

    res.status(StatusCodes.OK).json(await usageEventService.getHelpSpotsAsync(idUsuario, dias));
  } catch (error) {
    res.status(error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

// Perfil de memoria (Sesion 25): todo lo que la app ya sabe de esta
// persona (vocabulario, patrones, evolucion, pictogramas que mas usa,
// tarjetas de autonomia que mas le sirven), en un solo lugar, cacheado
// 1h. 100% derivado de datos que ya se registran — nada de carga manual.
// Mismo guard de lectura que el resto de este controller.
router.get('/usuario/:idUsuario/memoria', authMiddleware, async (req, res, next) => {
  try {
    const idUsuario = parseInt(req.params.idUsuario, 10);
    await AuthorizationService.assertCanReadUsuarioConfig(req.user.id, idUsuario);

    const profile = await memoryProfileService.getProfileAsync(idUsuario);
    res.status(StatusCodes.OK).json(profile);
  } catch (error) {
    res.status(error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

export default router;
