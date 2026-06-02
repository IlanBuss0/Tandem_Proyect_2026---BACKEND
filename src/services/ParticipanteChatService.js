import ParticipanteChatRepository from '../repositories/ParticipanteChatRepository.js';
import BD from '../db/BD.js';
import {
  addCachedChatMember,
  hydrateCachedChatMembers,
  isCachedChatMember,
  removeCachedChatMember,
} from '../cache/chatMembershipCache.js';

export default class ParticipanteChatService {
  constructor() {
    console.log('Estoy en: ParticipanteChatService.constructor()');
    this.ParticipanteChatRepository = new ParticipanteChatRepository();
  }

  getAllAsync = async () => { console.log('ParticipanteChatService.getAllAsync()'); const r = await this.ParticipanteChatRepository.getAllAsync(); if (r == null) return null; return r; };
  getByIdAsync = async (id) => { console.log(`ParticipanteChatService.getByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id del participante es invalido.'); } return await this.ParticipanteChatRepository.getByIdAsync(id); };
  getByChatIdAsync = async (idChat) => {
    console.log(`ParticipanteChatService.getByChatIdAsync(${idChat})`);
    if (!idChat || Number.isNaN(idChat)) { throw new Error('El id del chat es invalido.'); }
    const participantes = await this.ParticipanteChatRepository.getByChatIdAsync(idChat);
    await hydrateCachedChatMembers(idChat, participantes);
    return participantes;
  };
  getByChatAndUsuarioAsync = async (idChat, idUsuario) => { console.log(`ParticipanteChatService.getByChatAndUsuarioAsync(${idChat}, ${idUsuario})`); if (!idChat || Number.isNaN(idChat)) { throw new Error('El id del chat es invalido.'); } if (!idUsuario || Number.isNaN(idUsuario)) { throw new Error('El id del usuario es invalido.'); } return await this.ParticipanteChatRepository.getByChatAndUsuarioAsync(idChat, idUsuario); };

  ensureActiveParticipantAsync = async (idChat, idUsuario) => {
    const cachedMember = await isCachedChatMember(idChat, idUsuario);
    if (cachedMember === true) {
      return { id_chat: idChat, id_usuario: idUsuario };
    }

    const participante = await this.getByChatAndUsuarioAsync(idChat, idUsuario);
    if (!participante || participante.fecha_salida) {
      await removeCachedChatMember(idChat, idUsuario);
      throw new Error('El usuario no es participante activo del chat.');
    }

    await addCachedChatMember(idChat, idUsuario);
    return participante;
  };

  marcarComoLeidoAsync = async (idChat, idUsuario, idMensaje) => {
    console.log(`ParticipanteChatService.marcarComoLeidoAsync(${idChat}, ${idUsuario}, ${idMensaje})`);
    if (!idChat) throw new Error('idChat es obligatorio.');
    if (!idUsuario) throw new Error('idUsuario es obligatorio.');
    
    // Si no mandan idMensaje, buscamos el ultimo mensaje del chat
    let mensajeId = idMensaje;
    if (!mensajeId) {
        const sql = 'SELECT id FROM mensajes WHERE id_chat = $1 ORDER BY id DESC LIMIT 1';
        const lastMsg = await BD.queryOne(sql, [idChat]); // Necesitaria importar BD o hacerlo en repo
        // Mejor lo dejamos que el repo o controller maneje esto. 
        // Por ahora asumimos que el frontend manda el id del ultimo mensaje que vio.
    }

    return await this.ParticipanteChatRepository.marcarComoLeidoAsync(idChat, idUsuario, idMensaje);
  };

  hideForUserAsync = async (idChat, idUsuario) => {
    console.log(`ParticipanteChatService.hideForUserAsync(${idChat}, ${idUsuario})`);
    await this.ensureActiveParticipantAsync(idChat, idUsuario);
    return await this.ParticipanteChatRepository.hideForUserAsync(idChat, idUsuario);
  };

  createAsync = async (entity) => {
    console.log(`ParticipanteChatService.createAsync(${JSON.stringify(entity)})`);
    this.validarParticipanteParaCrear(entity);
    const existente = await this.ParticipanteChatRepository.getByChatAndUsuarioAsync(entity.id_chat, entity.id_usuario);
    if (existente != null) { throw new Error(`El usuario ${entity.id_usuario} ya es participante del chat ${entity.id_chat}.`); }
    const newId = await this.ParticipanteChatRepository.createAsync(entity);
    if (!entity.fecha_salida) {
      await addCachedChatMember(entity.id_chat, entity.id_usuario);
    }
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`ParticipanteChatService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) { throw new Error('El id del participante es obligatorio para actualizar.'); }
    const prev = await this.ParticipanteChatRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    const rowsAffected = await this.ParticipanteChatRepository.updateAsync(entity);
    const nextFechaSalida = entity?.fecha_salida ?? prev.fecha_salida;
    if (nextFechaSalida) {
      await removeCachedChatMember(prev.id_chat, prev.id_usuario);
    } else {
      await addCachedChatMember(entity?.id_chat ?? prev.id_chat, entity?.id_usuario ?? prev.id_usuario);
    }
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`ParticipanteChatService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) { throw new Error('El id del participante es invalido.'); }
    const prev = await this.ParticipanteChatRepository.getByIdAsync(id);
    const rowsAffected = await this.ParticipanteChatRepository.deleteByIdAsync(id);
    if (prev) {
      await removeCachedChatMember(prev.id_chat, prev.id_usuario);
    }
    return rowsAffected;
  };

  validarParticipanteParaCrear = (entity) => {
    if (!entity) throw new Error('El participante es obligatorio.');
    if (!entity.id_chat) throw new Error('id_chat es obligatorio.');
    if (!entity.id_usuario) throw new Error('id_usuario es obligatorio.');
    if (!entity.fecha_ingreso) throw new Error('fecha_ingreso es obligatorio.');
  };
}
