import SesionProfesionalRepository from '../repositories/SesionProfesionalRepository.js';
import PertenecienteRepository from '../repositories/PertenecienteRepository.js';
import NotificationProducerService from './NotificationProducerService.js';
import BD from '../db/BD.js';

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

  updateAsync = async (entity) => {
    console.log(`SesionProfesionalService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id de la sesion profesional es obligatorio para actualizar.');
    }
    const previousEntity = await this.SesionProfesionalRepository.getByIdAsync(entity.id);
    if (previousEntity == null) return 0;
    const rowsAffected = await this.SesionProfesionalRepository.updateAsync(entity);
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
}
