import ChatRepository from '../repositories/ChatRepository.js';

export default class ChatService {
  constructor() {
    console.log('Estoy en: ChatService.constructor()');
    this.ChatRepository = new ChatRepository();
  }

  getAllAsync = async () => { console.log('ChatService.getAllAsync()'); const r = await this.ChatRepository.getAllAsync(); if (r == null) return null; return r; };
  getByIdAsync = async (id) => { console.log(`ChatService.getByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id del chat es invalido.'); } return await this.ChatRepository.getByIdAsync(id); };
  createAsync = async (entity) => { console.log(`ChatService.createAsync(${JSON.stringify(entity)})`); this.validarChatParaCrear(entity); return await this.ChatRepository.createAsync(entity); };
  updateAsync = async (entity) => { console.log(`ChatService.updateAsync(${JSON.stringify(entity)})`); if (!entity?.id || Number.isNaN(entity.id)) { throw new Error('El id del chat es obligatorio para actualizar.'); } const prev = await this.ChatRepository.getByIdAsync(entity.id); if (prev == null) return 0; return await this.ChatRepository.updateAsync(entity); };
  deleteByIdAsync = async (id) => { console.log(`ChatService.deleteByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id del chat es invalido.'); } return await this.ChatRepository.deleteByIdAsync(id); };

  validarChatParaCrear = (entity) => {
    if (!entity) throw new Error('El chat es obligatorio.');
    if (!entity.id_tipo_chat) throw new Error('id_tipo_chat es obligatorio.');
    if (!entity.fecha_creacion) throw new Error('fecha_creacion es obligatorio.');
  };
}
