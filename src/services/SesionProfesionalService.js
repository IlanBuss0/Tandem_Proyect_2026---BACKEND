import SesionProfesionalRepository from '../repositories/SesionProfesionalRepository.js';
import PertenecienteRepository from '../repositories/PertenecienteRepository.js';
import NotificationProducerService from './NotificationProducerService.js';
import BD from '../db/BD.js';
import crypto from 'node:crypto';

const RECURRENCE_PRESETS = new Set(['none', 'weekly', 'twice_weekly', 'biweekly', 'monthly']);

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

  updateAsync = async (entity) => {
    console.log(`SesionProfesionalService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id de la sesion profesional es obligatorio para actualizar.');
    }
    const previousEntity = await this.SesionProfesionalRepository.getByIdAsync(entity.id);
    if (previousEntity == null) return 0;
    this.validarSesionParaActualizar(entity);
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

  savePrivateNoteAsync = async (idSesion, idProfesional, contenido) => {
    const session = await this.SesionProfesionalRepository.getByIdAsync(idSesion);
    if (!session) return null;
    if (Number(session.id_profesional) !== Number(idProfesional)) {
      const error = new Error('La nota privada pertenece a otro profesional.');
      error.statusCode = 403;
      throw error;
    }
    if (!contenido || contenido.type !== 'doc' || !Array.isArray(contenido.content)) {
      const error = new Error('El contenido de la nota no tiene un formato valido.');
      error.statusCode = 400;
      throw error;
    }
    if (JSON.stringify(contenido).length > 100000) {
      const error = new Error('La nota supera el limite de 100 KB.');
      error.statusCode = 413;
      throw error;
    }
    return await this.SesionProfesionalRepository.upsertPrivateNoteAsync(idSesion, idProfesional, contenido);
  };

  linkDriveDocumentAsync = async (idSesion, idProfesional, document) => {
    let note = await this.getPrivateNoteAsync(idSesion, idProfesional);
    if (!note) {
      note = await this.savePrivateNoteAsync(idSesion, idProfesional, { type: 'doc', content: [] });
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
