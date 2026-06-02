import MensajeRepository from '../repositories/MensajeRepository.js';
import ParticipanteChatService from './ParticipanteChatService.js';
import ChatNotificationJobService from './ChatNotificationJobService.js';
import { enqueueChatMessageNotifications } from '../queues/notificationQueue.js';

export default class MensajeService {
  constructor() {
    console.log('Estoy en: MensajeService.constructor()');
    this.MensajeRepository = new MensajeRepository();
    this.ParticipanteChatService = new ParticipanteChatService();  
    this.ChatNotificationJobService = new ChatNotificationJobService();
  }

  getAllAsync = async () => { console.log('MensajeService.getAllAsync()'); const r = await this.MensajeRepository.getAllAsync(); if (r == null) return null; return r; };
  getByIdAsync = async (id) => { console.log(`MensajeService.getByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id del mensaje es invalido.'); } return await this.MensajeRepository.getByIdAsync(id); };
  
  getByChatIdAsync = async (idChat, limit = 30, beforeId = null) => { 
    console.log(`MensajeService.getByChatIdAsync(${idChat}, ${limit}, ${beforeId})`); 
    if (!idChat || Number.isNaN(idChat)) { throw new Error('El id del chat es invalido.'); } 
    return await this.MensajeRepository.getByChatIdAsync(idChat, limit, beforeId); 
  };

  getByChatForUserAsync = async (idChat, idUsuario, limit = 30, beforeId = null) => { 
    await this.ParticipanteChatService.ensureActiveParticipantAsync(idChat, idUsuario); 
    return await this.MensajeRepository.getByChatForParticipantAsync(idChat, idUsuario, limit, beforeId); 
  };

  createAsync = async (entity) => { console.log(`MensajeService.createAsync(${JSON.stringify(entity)})`); this.validarMensajeParaCrear(entity); return await this.MensajeRepository.createAsync(entity); };

  createFromUserAsync = async (entity) => {
    console.log(`MensajeService.createFromUserAsync(${JSON.stringify(entity)})`);
    await this.ParticipanteChatService.ensureActiveParticipantAsync(entity?.id_chat, entity?.id_usuario_emisor);
    this.validarMensajeParaCrear(entity);
    const newId = await this.MensajeRepository.createAsync(entity);
    const message = await this.MensajeRepository.getByIdAsync(newId);

    await this.enqueueNotificationsAsync(message);

    return message;
  };

  enqueueNotificationsAsync = async (message) => {
    const queued = await enqueueChatMessageNotifications({
      messageId: message.id,
      idChat: message.id_chat,
      idUsuarioEmisor: message.id_usuario_emisor,
    });

    if (queued) return;

    setImmediate(() => {
      this.ChatNotificationJobService
        .processMessageNotificationsAsync({ messageId: message.id })
        .catch((err) => console.error('Error notificaciones:', err.message));
    });
  };

  updateFromUserAsync = async (entity, idUsuario) => {
    console.log(`MensajeService.updateFromUserAsync(${entity.id}, ${idUsuario})`);
    const mensaje = await this.getByIdAsync(entity.id);
    if (!mensaje) throw new Error('Mensaje no encontrado.');
    if (mensaje.id_usuario_emisor !== idUsuario) {
        throw new Error('No tienes permiso para editar este mensaje.');
    }
    const updatedEntity = { ...mensaje, contenido: entity.contenido };
    return await this.MensajeRepository.updateAsync(updatedEntity);
  };

  deleteFromUserAsync = async (id, idUsuario) => {
    console.log(`MensajeService.deleteFromUserAsync(${id}, ${idUsuario})`);
    const mensaje = await this.getByIdAsync(id);
    if (!mensaje) throw new Error('Mensaje no encontrado.');
    if (mensaje.id_usuario_emisor !== idUsuario) {
        throw new Error('No tienes permiso para eliminar este mensaje.');
    }
    return await this.MensajeRepository.deleteByIdAsync(id);
  };

  updateAsync = async (entity) => { console.log(`MensajeService.updateAsync(${JSON.stringify(entity)})`); if (!entity?.id || Number.isNaN(entity.id)) { throw new Error('El id del mensaje es obligatorio para actualizar.'); } const prev = await this.MensajeRepository.getByIdAsync(entity.id); if (prev == null) return 0; return await this.MensajeRepository.updateAsync(entity); };
  deleteByIdAsync = async (id) => { console.log(`MensajeService.deleteByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id del mensaje es invalido.'); } return await this.MensajeRepository.deleteByIdAsync(id); };

  validarMensajeParaCrear = (entity) => {
    if (!entity) throw new Error('El mensaje es obligatorio.');
    if (!entity.id_chat) throw new Error('id_chat es obligatorio.');
    if (!entity.id_usuario_emisor) throw new Error('id_usuario_emisor es obligatorio.');
    if (!entity.id_tipo_mensaje) throw new Error('id_tipo_mensaje es obligatorio.');
    if (!entity.fecha_envio) throw new Error('fecha_envio es obligatorio.');
  };
}
