import SesionProfesionalRepository from '../repositories/SesionProfesionalRepository.js';
import PertenecienteRepository from '../repositories/PertenecienteRepository.js';
import NotificationProducerService from './NotificationProducerService.js';
import BD from '../db/BD.js';
import crypto from 'node:crypto';

const RECURRENCE_PRESETS = new Set(['none', 'weekly', 'twice_weekly', 'biweekly', 'monthly']);
const ESTADOS = new Set(['programada', 'completada', 'cancelada', 'ausente']);

export default class SesionProfesionalService {
  constructor() {
    console.log('Estoy en: SesionProfesionalService.constructor()');
    this.SesionProfesionalRepository = new SesionProfesionalRepository();
    this.PertenecienteRepository = new PertenecienteRepository();
    this.NotificationProducerService = new NotificationProducerService();
  }

  getAllAsync = async () => {
    console.log('SesionProfesionalService.getAllAsync()');
    const returnArray = await this.SesionProfesionalRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`SesionProfesionalService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id de la sesion profesional es invalido.');
    }
    const returnEntity = await this.SesionProfesionalRepository.getByIdAsync(id);
    return returnEntity;
  };

  getByPertenecienteIdAsync = async (idPerteneciente) => {
    console.log(`SesionProfesionalService.getByPertenecienteIdAsync(${idPerteneciente})`);
    if (!idPerteneciente || Number.isNaN(idPerteneciente)) {
      throw new Error('El id del perteneciente es invalido.');
    }
    return await this.SesionProfesionalRepository.getByPertenecienteIdAsync(idPerteneciente);
  };

  getByProfesionalIdAsync = async (idProfesional) => {
    console.log(`SesionProfesionalService.getByProfesionalIdAsync(${idProfesional})`);
    if (!idProfesional || Number.isNaN(idProfesional)) {
      throw new Error('El id del profesional es invalido.');
    }
    return await this.SesionProfesionalRepository.getByProfesionalIdAsync(idProfesional);
  };

  createAsync = async (entity) => {
    console.log(`SesionProfesionalService.createAsync(${JSON.stringify(entity)})`);
    this.validarSesionParaCrear(entity);
    this.normalizeMotivoCancelacion(entity);
    if (entity.recurrence_rule?.frequency && entity.recurrence_rule.frequency !== 'none') {
      return await this.createRecurringAsync(entity);
    }
    const newId = await this.SesionProfesionalRepository.createAsync(entity);
    const [perteneciente, profesional] = await Promise.all([
      this.PertenecienteRepository.getByIdAsync(entity.id_perteneciente),
      BD.queryOne(`SELECT id_usuario FROM profesionales WHERE id = $1`, [entity.id_profesional]),
    ]);
    if (perteneciente) {
      await this.NotificationProducerService.createAsync({
        recipientUserId: perteneciente.id_usuario,
        actorUserId: profesional?.id_usuario ?? null,
        contextUserId: perteneciente.id_usuario,
        typeName: 'Recordatorio',
        title: 'Nueva sesión programada',
        body: `Sesión programada para ${new Date(entity.fecha_sesion).toLocaleString('es-AR')}.`,
        referenceType: 'calendar',
        referenceId: newId,
      });
    }
    return newId;
  };

  createRecurringAsync = async (entity) => {
    const rule = this.normalizeRecurrenceRule(entity.recurrence_rule);
    const groupId = crypto.randomUUID();
    const dates = this.buildRecurringDates(entity.fecha_sesion, rule);
    // Todas las ocurrencias se insertan en una sola transaccion: si una
    // falla a mitad de camino, no queda una serie fantasma a medias.
    const ids = await this.SesionProfesionalRepository.createManyAsync(
      dates.map((date, index) => ({
        ...entity,
        fecha_sesion: date.toISOString(),
        recurrence_group_id: groupId,
        recurrence_rule: rule,
        recurrence_index: index,
      })),
    );

    const [perteneciente, profesional] = await Promise.all([
      this.PertenecienteRepository.getByIdAsync(entity.id_perteneciente),
      BD.queryOne(`SELECT id_usuario FROM profesionales WHERE id = $1`, [entity.id_profesional]),
    ]);
    if (perteneciente) {
      await this.NotificationProducerService.createAsync({
        recipientUserId: perteneciente.id_usuario,
        actorUserId: profesional?.id_usuario ?? null,
        contextUserId: perteneciente.id_usuario,
        typeName: 'Recordatorio',
        title: 'Sesiones programadas',
        body: `Se programaron ${ids.length} sesiones recurrentes.`,
        referenceType: 'calendar',
        referenceId: ids[0],
      });
    }
    return ids[0] ?? 0;
  };

  resizeSeriesAsync = async (groupId, idProfesional, { titulo, count, markPastAsCompleted } = {}) => {
    console.log(`SesionProfesionalService.resizeSeriesAsync(${groupId}, ${idProfesional}, ${JSON.stringify({ titulo, count, markPastAsCompleted })})`);
    if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(String(groupId || ''))) {
      const error = new Error('Identificador de serie invalido.');
      error.statusCode = 400;
      throw error;
    }
    if (count !== undefined && (!Number.isInteger(count) || count < 1 || count > 52)) {
      const error = new Error('La cantidad de sesiones debe estar entre 1 y 52.');
      error.statusCode = 400;
      throw error;
    }
    if (titulo !== undefined && !String(titulo).trim()) {
      const error = new Error('El titulo no puede estar vacio.');
      error.statusCode = 400;
      throw error;
    }
    const nextTitulo = titulo !== undefined ? String(titulo).trim() : undefined;

    return await this.SesionProfesionalRepository.resizeSeriesAsync(groupId, (rows, pastCount) => {
      if (!rows.length) {
        const error = new Error('Serie no encontrada.');
        error.statusCode = 404;
        throw error;
      }
      if (rows.some((row) => Number(row.id_profesional) !== Number(idProfesional))) {
        const error = new Error('No autorizado para modificar esta serie.');
        error.statusCode = 403;
        throw error;
      }

      const effectiveTitulo = nextTitulo;
      let toInsert = [];
      let toDeleteIds = [];
      // Todas las filas de una serie comparten recurrence_rule (se copia
      // igual en cada fila al crearla) — se toma la de la primera como base.
      let finalRule = rows[0].recurrence_rule || { frequency: 'none', count: rows.length };

      if (count !== undefined && count !== rows.length) {
        if (count < pastCount) {
          const error = new Error(
            `No se puede bajar de ${pastCount} sesion${pastCount === 1 ? '' : 'es'}: ya pasaron esa cantidad.`,
          );
          error.statusCode = 400;
          throw error;
        }

        const rule = { ...(rows[0].recurrence_rule || {}), count };
        finalRule = rule;

        if (count > rows.length) {
          const allDates = this.buildRecurringDates(rows[0].fecha_sesion, rule);
          const newDates = allDates.slice(rows.length);
          const nextIndex = Math.max(...rows.map((row) => Number(row.recurrence_index) || 0)) + 1;
          const templateTitulo = effectiveTitulo ?? rows[0].titulo;
          toInsert = newDates.map((date, i) => ({
            id_profesional: rows[0].id_profesional,
            id_perteneciente: rows[0].id_perteneciente,
            fecha_sesion: date.toISOString(),
            titulo: templateTitulo,
            duracion_minutos: rows[0].duracion_minutos,
            // Nunca heredar 'cancelada'/'completada' de una fila vieja: las
            // sesiones nuevas todavia no ocurrieron.
            estado: 'programada',
            recordatorios: [],
            recurrence_group_id: groupId,
            recurrence_rule: rule,
            recurrence_index: nextIndex + i,
          }));
        } else {
          // Por construccion (count >= pastCount) estas filas son siempre
          // futuras, nunca sesiones que ya ocurrieron.
          toDeleteIds = rows.slice(count).map((row) => row.id);
        }
      }

      let toCompleteIds = [];
      if (markPastAsCompleted) {
        const deletedSet = new Set(toDeleteIds);
        const now = Date.now();
        toCompleteIds = rows
          .filter((row) => !deletedSet.has(row.id) && row.estado === 'programada' && new Date(row.fecha_sesion).getTime() <= now)
          .map((row) => row.id);
      }

      return { effectiveTitulo, toInsert, toDeleteIds, toCompleteIds, finalRule };
    });
  };

  updateAsync = async (entity) => {
    console.log(`SesionProfesionalService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id de la sesion profesional es obligatorio para actualizar.');
    }
    const previousEntity = await this.SesionProfesionalRepository.getByIdAsync(entity.id);
    if (previousEntity == null) return 0;
    this.validarSesionParaActualizar(entity);
    this.normalizeMotivoCancelacion(entity);
    const rowsAffected = await this.SesionProfesionalRepository.updateAsync(entity, previousEntity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`SesionProfesionalService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id de la sesion profesional es invalido.');
    }
    const rowsAffected = await this.SesionProfesionalRepository.deleteByIdAsync(id);
    return rowsAffected;
  };

  getPrivateNoteAsync = async (idSesion, idProfesional) => {
    const session = await this.SesionProfesionalRepository.getByIdAsync(idSesion);
    if (!session) return null;
    if (Number(session.id_profesional) !== Number(idProfesional)) {
      const error = new Error('La nota privada pertenece a otro profesional.');
      error.statusCode = 403;
      throw error;
    }
    return await this.SesionProfesionalRepository.getPrivateNoteAsync(idSesion, idProfesional);
  };

  linkDriveDocumentAsync = async (idSesion, idProfesional, document) => {
    const session = await this.SesionProfesionalRepository.getByIdAsync(idSesion);
    if (!session) {
      const error = new Error('Sesion no encontrada.');
      error.statusCode = 404;
      throw error;
    }
    if (Number(session.id_profesional) !== Number(idProfesional)) {
      const error = new Error('La nota privada pertenece a otro profesional.');
      error.statusCode = 403;
      throw error;
    }
    let note = await this.getPrivateNoteAsync(idSesion, idProfesional);
    if (!note) {
      note = await this.SesionProfesionalRepository.ensurePrivateNoteAsync(idSesion, idProfesional);
    }
    const fileId = String(document?.google_file_id || '').trim();
    if (!/^[A-Za-z0-9_-]{10,255}$/.test(fileId)) {
      const error = new Error('Identificador de Google Drive invalido.');
      error.statusCode = 400;
      throw error;
    }
    const mimeType = 'application/vnd.google-apps.document';
    return await this.SesionProfesionalRepository.upsertDriveDocumentAsync(note.id, {
      google_file_id: fileId,
      nombre: String(document?.nombre || 'Documento de Google').trim().slice(0, 255),
      mime_type: mimeType,
      web_view_url: `https://docs.google.com/document/d/${fileId}/edit`,
    });
  };

  unlinkDriveDocumentAsync = async (idSesion, idProfesional) => {
    const note = await this.getPrivateNoteAsync(idSesion, idProfesional);
    if (!note) return 0;
    return await this.SesionProfesionalRepository.deleteDriveDocumentAsync(note.id);
  };

  validarSesionParaCrear = (entity) => {
    if (!entity) {
      throw new Error('La sesion profesional es obligatoria.');
    }
    if (!entity.id_profesional) {
      throw new Error('id_profesional es obligatorio.');
    }
    if (!entity.id_perteneciente) {
      throw new Error('id_perteneciente es obligatorio.');
    }
    if (!entity.fecha_sesion) {
      throw new Error('fecha_sesion es obligatorio.');
    }
    if (!Number.isInteger(Number(entity.duracion_minutos)) || Number(entity.duracion_minutos) < 15 || Number(entity.duracion_minutos) > 480) {
      throw new Error('duracion_minutos debe estar entre 15 y 480.');
    }
    if (entity.estado !== undefined && !ESTADOS.has(entity.estado)) {
      throw new Error(`estado debe ser uno de: ${Array.from(ESTADOS).join(', ')}.`);
    }
  };

  validarSesionParaActualizar = (entity) => {
    // PUT es un update parcial (el repository hace COALESCE con el valor
    // previo campo a campo), asi que solo se valida lo que efectivamente
    // vino en el body — nunca se exige lo que no se esta tocando.
    if (entity.duracion_minutos !== undefined && entity.duracion_minutos !== null) {
      if (!Number.isInteger(Number(entity.duracion_minutos)) || Number(entity.duracion_minutos) < 15 || Number(entity.duracion_minutos) > 480) {
        const error = new Error('duracion_minutos debe estar entre 15 y 480.');
        error.statusCode = 400;
        throw error;
      }
    }
    if (entity.fecha_sesion !== undefined && entity.fecha_sesion !== null) {
      if (Number.isNaN(new Date(entity.fecha_sesion).getTime())) {
        const error = new Error('fecha_sesion es invalida.');
        error.statusCode = 400;
        throw error;
      }
    }
    if (entity.estado !== undefined && !ESTADOS.has(entity.estado)) {
      const error = new Error(`estado debe ser uno de: ${Array.from(ESTADOS).join(', ')}.`);
      error.statusCode = 400;
      throw error;
    }
    if (entity.motivo_cancelacion !== undefined && entity.motivo_cancelacion !== null && String(entity.motivo_cancelacion).length > 240) {
      const error = new Error('motivo_cancelacion no puede superar los 240 caracteres.');
      error.statusCode = 400;
      throw error;
    }
  };

  /** Nunca dejar un motivo de cancelacion pegado a una sesion que no esta cancelada. */
  normalizeMotivoCancelacion = (entity) => {
    if (entity.estado !== 'cancelada') {
      entity.motivo_cancelacion = null;
    }
  };

  normalizeRecurrenceRule = (rule) => {
    if (!rule || typeof rule !== 'object') return { frequency: 'none' };
    const frequency = String(rule.frequency || 'none');
    if (!RECURRENCE_PRESETS.has(frequency)) {
      const error = new Error('Frecuencia de recurrencia invalida.');
      error.statusCode = 400;
      throw error;
    }
    const count = Math.max(1, Math.min(Number(rule.count || 1), 52));
    return { frequency, count };
  };

  buildRecurringDates = (start, rule) => {
    const first = new Date(start);
    if (Number.isNaN(first.getTime())) {
      const error = new Error('fecha_sesion es invalida.');
      error.statusCode = 400;
      throw error;
    }
    const dates = [];
    const pushDate = (date) => dates.push(new Date(date.getTime()));
    for (let i = 0; i < rule.count; i += 1) {
      const date = new Date(first.getTime());
      if (rule.frequency === 'weekly') date.setDate(first.getDate() + i * 7);
      else if (rule.frequency === 'biweekly') date.setDate(first.getDate() + i * 14);
      else if (rule.frequency === 'monthly') date.setMonth(first.getMonth() + i);
      else if (rule.frequency === 'twice_weekly') {
        const week = Math.floor(i / 2);
        const offset = i % 2 === 0 ? 0 : 3;
        date.setDate(first.getDate() + week * 7 + offset);
      }
      pushDate(date);
    }
    return dates;
  };
}
