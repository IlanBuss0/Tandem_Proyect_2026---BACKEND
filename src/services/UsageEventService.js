import UsageEventRepository from '../repositories/UsageEventRepository.js';
import ActividadAsignadaRepository from '../repositories/ActividadAsignadaRepository.js';
import { validateUsageEvent } from '../modules/usage/event-types.js';
import { buildHelpSpotsReport } from '../modules/usage/help-spots.js';

// Unica responsabilidad: orquestar el guardado de un evento de uso.
// Fire-and-forget por diseno (misma disciplina que NotificationProducerService):
// registrar que alguien completo un paso o registro una emocion NUNCA debe
// poder romper la accion real que la origino. Si el log falla, se traga el
// error y se loguea server-side, no se propaga.
export default class UsageEventService {
  constructor() {
    this.UsageEventRepository = new UsageEventRepository();
    this.ActividadAsignadaRepository = new ActividadAsignadaRepository();
    this.schemaReady = null;
  }

  async ensureSchemaAsync() {
    if (!this.schemaReady) this.schemaReady = this.UsageEventRepository.ensureSchemaAsync();
    return await this.schemaReady;
  }

  async logAsync(event) {
    try {
      const error = validateUsageEvent(event);
      if (error) throw new Error(error);
      if (!event.idUsuario) throw new Error('idUsuario es obligatorio.');

      await this.ensureSchemaAsync();
      if (event.valor?.executionId) return await this.UsageEventRepository.createIdempotentAsync(event, event.valor.executionId);
      return await this.UsageEventRepository.createAsync(event);
    } catch (error) {
      // No se vuelca el evento: su valor puede incluir texto de la persona.
      console.error('[UsageEvent] no se pudo registrar', { tipoEvento: event?.tipoEvento, error: error.message });
      return null;
    }
  }

  // "Donde se traba": pasos donde mas pidio ayuda en los ultimos `dias`.
  async getHelpSpotsAsync(idUsuario, dias) {
    await this.ensureSchemaAsync();
    const desde = new Date(Date.now() - dias * 86400000).toISOString();
    const events = await this.UsageEventRepository.getHelpEventsSinceAsync(idUsuario, desde);

    // Los eventos nuevos traen titulo y pasoTexto; solo los anteriores a eso
    // necesitan leer la actividad.
    const asignadaIds = [...new Set(events
      .filter((event) => event.tipo_evento === 'ayuda_pedida' && !event.valor?.titulo)
      .map((event) => Number(event.entidad_id))
      .filter((id) => Number.isInteger(id) && id > 0))];
    const rows = await this.ActividadAsignadaRepository.getHelpContextByIdsAsync(asignadaIds, idUsuario);
    const contextById = new Map((rows || []).map((row) => [Number(row.id), row]));

    return buildHelpSpotsReport(events, contextById, { dias });
  }

  async logManyAsync(events) {
    const results = await Promise.all((events || []).map((event) => this.logAsync(event)));
    return results.filter((id) => id !== null).length;
  }

  async getForUsuarioAsync(idUsuario, options) {
    await this.ensureSchemaAsync();
    return await this.UsageEventRepository.getForUsuarioAsync(idUsuario, options);
  }

  async getForUsuarioSinceAsync(idUsuario, options) {
    await this.ensureSchemaAsync();
    return await this.UsageEventRepository.getForUsuarioSinceAsync(idUsuario, options);
  }
}
