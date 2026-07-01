import NotificacionRepository from '../repositories/NotificacionRepository.js';

import BD from '../db/BD.js';

export default class NotificacionService {
  constructor() {
    console.log('Estoy en: NotificacionService.constructor()');
    this.NotificacionRepository = new NotificacionRepository();
  }

  getAllAsync = async () => { console.log('NotificacionService.getAllAsync()'); const r = await this.NotificacionRepository.getAllAsync(); if (r == null) return null; return r; };

  getByIdAsync = async (id) => { console.log(`NotificacionService.getByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id de la notificacion es invalido.'); } return await this.NotificacionRepository.getByIdAsync(id); };

  getByUsuarioDestinoIdAsync = async (idUsuarioDestino) => {
    console.log(`NotificacionService.getByUsuarioDestinoIdAsync(${idUsuarioDestino})`);
    if (!idUsuarioDestino || Number.isNaN(Number(idUsuarioDestino))) throw new Error('El id de usuario es invalido.');
    return await this.NotificacionRepository.getByUsuarioDestinoIdAsync(idUsuarioDestino);
  };

  createAsync = async (entity) => { console.log(`NotificacionService.createAsync(${JSON.stringify(entity)})`); this.validarNotificacionParaCrear(entity); return await this.NotificacionRepository.createAsync(entity); };

  updateAsync = async (entity) => { console.log(`NotificacionService.updateAsync(${JSON.stringify(entity)})`); if (!entity?.id || Number.isNaN(entity.id)) { throw new Error('El id de la notificacion es obligatorio para actualizar.'); } const prev = await this.NotificacionRepository.getByIdAsync(entity.id); if (prev == null) return 0; return await this.NotificacionRepository.updateAsync(entity); };

  markAllAsReadForUserAsync = async (idUsuarioDestino) => {
    console.log(`NotificacionService.markAllAsReadForUserAsync(${idUsuarioDestino})`);
    if (!idUsuarioDestino || Number.isNaN(Number(idUsuarioDestino))) throw new Error('El id de usuario es invalido.');
    const sql = `UPDATE notificaciones SET leida = true, fecha_lectura = NOW() WHERE id_usuario_destino = $1 AND leida = false`;
    return await BD.execute(sql, [idUsuarioDestino]);
  };

  deleteByIdAsync = async (id) => { console.log(`NotificacionService.deleteByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id de la notificacion es invalido.'); } return await this.NotificacionRepository.deleteByIdAsync(id); };

  validarNotificacionParaCrear = (entity) => {
    if (!entity) throw new Error('La notificacion es obligatoria.');
    if (!entity.id_usuario_destino) throw new Error('id_usuario_destino es obligatorio.');
    if (!entity.id_tipo_notificacion) throw new Error('id_tipo_notificacion es obligatorio.');
    if (!entity.titulo) throw new Error('titulo es obligatorio.');
    if (!entity.fecha_creacion) throw new Error('fecha_creacion es obligatorio.');
  };
}
