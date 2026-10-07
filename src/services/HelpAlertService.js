import { cacheService } from './CacheService.js';
import NotificationProducerService from './NotificationProducerService.js';
import UsageEventService from './UsageEventService.js';
import VinculoTutorPertenecienteRepository from '../repositories/VinculoTutorPertenecienteRepository.js';
import { USAGE_EVENT_TYPES } from '../modules/usage/event-types.js';

export const HELP_MOTIVOS = ['ayuda', 'no_entiende', 'pausa'];
const HELP_CACHE_TTL_SECONDS = 60;

/** Texto libre del usuario: sin caracteres de control, espacios normalizados y recortado. */
export const cleanHelpText = (value, max) => (typeof value === 'string'
  // eslint-disable-next-line no-control-regex
  ? value.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max).trim()
  : '');

/**
 * Unica responsabilidad: la parte comun de "avisar a los tutores que la persona
 * pidio ayuda" (actividades, rutinas y "No puedo hablar"): tutores activos,
 * una notificacion de Alerta por tutor, evento de uso y anti-repeticion.
 * Quien llama valida, arma los textos y decide la clave de cache.
 */
export default class HelpAlertService {
  constructor() {
    this.VinculoTutorPertenecienteRepository = new VinculoTutorPertenecienteRepository();
    this.NotificationProducerService = new NotificationProducerService();
    this.UsageEventService = new UsageEventService();
  }

  /**
   * @param {object} params
   * @param {number|string} params.idUsuario usuario del perteneciente que pide ayuda
   * @param {number} params.idPerteneciente
   * @param {string} params.motivo ayuda | no_entiende | pausa
   * @param {string} params.title
   * @param {string} params.body
   * @param {string} params.cacheKey clave de anti-repeticion (60 s)
   * @param {number|null} params.referenceId
   * @param {{ entidadTipo: string, entidadId: string, valor: object }} params.usageEvent `avisados` se suma aca
   * @returns {Promise<{ avisados: string[], repetido: boolean }>} avisados = primer nombre de cada tutor avisado
   */
  sendAsync = async ({ idUsuario, idPerteneciente, motivo, title, body, cacheKey, referenceId = null, usageEvent }) => {
    const cached = await cacheService.get(cacheKey);
    if (cached) return { avisados: Array.isArray(cached) ? cached : [], repetido: true };

    const tutores = await this.VinculoTutorPertenecienteRepository.getActiveTutorUsersAsync(idPerteneciente);

    const avisados = [];
    for (const tutor of tutores || []) {
      const notificationId = await this.NotificationProducerService.createAsync({
        recipientUserId: tutor.id_usuario,
        actorUserId: Number(idUsuario),
        contextUserId: Number(idUsuario),
        typeName: 'Alerta',
        title,
        body,
        referenceType: `activity_help:${motivo}`,
        referenceId,
      });
      if (notificationId) avisados.push(String(tutor.nombre || '').trim().split(/\s+/)[0]);
    }

    // Fire-and-forget: un fallo del registro nunca rompe la respuesta.
    try {
      Promise.resolve(this.UsageEventService.logAsync({
        idUsuario: Number(idUsuario),
        tipoEvento: USAGE_EVENT_TYPES.AYUDA_PEDIDA,
        entidadTipo: usageEvent.entidadTipo,
        entidadId: usageEvent.entidadId,
        valor: { ...usageEvent.valor, avisados: avisados.length },
        origen: 'perteneciente',
      })).catch(() => {});
    } catch {
      // silencioso a proposito
    }

    // Sin avisados no se cachea: "Probar de nuevo" tiene que volver a intentar.
    if (avisados.length > 0) await cacheService.set(cacheKey, avisados, HELP_CACHE_TTL_SECONDS);
    return { avisados, repetido: false };
  };
}
