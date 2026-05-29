import MensajeRepository from '../repositories/MensajeRepository.js';
import ParticipanteChatService from './ParticipanteChatService.js';
import NotificacionService from './NotificacionService.js';
import { emitToUser } from '../realtime/realtime.js';
import BD from '../db/BD.js';

export default class MensajeService {
  constructor() {
    console.log('Estoy en: MensajeService.constructor()');
    this.MensajeRepository = new MensajeRepository();
    this.ParticipanteChatService = new ParticipanteChatService();  
    this.NotificacionService = new NotificacionService();
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
    return await this.getByChatIdAsync(idChat, limit, beforeId); 
  };

  createAsync = async (entity) => { console.log(`MensajeService.createAsync(${JSON.stringify(entity)})`); this.validarMensajeParaCrear(entity); return await this.MensajeRepository.createAsync(entity); };

  createFromUserAsync = async (entity) => {
    console.log(`MensajeService.createFromUserAsync(${JSON.stringify(entity)})`);
    await this.ParticipanteChatService.ensureActiveParticipantAsync(entity?.id_chat, entity?.id_usuario_emisor);
    this.validarMensajeParaCrear(entity);
    const newId = await this.MensajeRepository.createAsync(entity);
    const message = await this.MensajeRepository.getByIdAsync(newId);

    // Procesar notificaciones en segundo plano para no demorar la respuesta
    this.procesarNotificacionesAsync(message).catch(err => console.error('Error notificaciones:', err.message));

    return message;
  };

  procesarNotificacionesAsync = async (message) => {
    const participantes = await this.ParticipanteChatService.getByChatIdAsync(message.id_chat);
    const otros = participantes.filter(p => p.id_usuario !== message.id_usuario_emisor && !p.fecha_salida);

    // Buscar ID del tipo de notificacion 'Chat'
    const tipoChat = await BD.queryOne("SELECT id FROM tipos_notificaciones WHERE LOWER(nombre) = 'chat'");
    const idTipoChat = tipoChat ? tipoChat.id : 2; // Fallback a 'Informacion'

    for (const otro of otros) {
        try {
            await this.NotificacionService.createAsync({
                id_usuario_destino: otro.id_usuario,
                id_tipo_notificacion: idTipoChat,
                titulo: 'Nuevo mensaje',
                contenido: message.contenido.substring(0, 50),
                fecha_creacion: new Date(),
                leida: false
            });

            emitToUser(otro.id_usuario, 'notification:new', {
                type: 'chat_message',
                id_chat: message.id_chat,
                id_mensaje: message.id,
                contenido: message.contenido,
                id_usuario_emisor: message.id_usuario_emisor
            });
        } catch (e) {
            console.error(`Error notificando al usuario ${otro.id_usuario}:`, e.message);
        }
    }
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
