import ParticipanteChatRepository from '../repositories/ParticipanteChatRepository.js';

export default class ParticipanteChatService {
  constructor() {
    console.log('Estoy en: ParticipanteChatService.constructor()');
    this.ParticipanteChatRepository = new ParticipanteChatRepository();
  }

  getAllAsync = async () => { console.log('ParticipanteChatService.getAllAsync()'); const r = await this.ParticipanteChatRepository.getAllAsync(); if (r == null) return null; return r; };
  getByIdAsync = async (id) => { console.log(`ParticipanteChatService.getByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id del participante es inválido.'); } return await this.ParticipanteChatRepository.getByIdAsync(id); };

  createAsync = async (entity) => {
    console.log(`ParticipanteChatService.createAsync(${JSON.stringify(entity)})`);
    this.validarParticipanteParaCrear(entity);
    const existente = await this.ParticipanteChatRepository.getByChatAndUsuarioAsync(entity.id_chat, entity.id_usuario);
    if (existente != null) { throw new Error(`El usuario ${entity.id_usuario} ya es participante del chat ${entity.id_chat}.`); }
    return await this.ParticipanteChatRepository.createAsync(entity);
  };

  updateAsync = async (entity) => { console.log(`ParticipanteChatService.updateAsync(${JSON.stringify(entity)})`); if (!entity?.id || Number.isNaN(entity.id)) { throw new Error('El id del participante es obligatorio para actualizar.'); } const prev = await this.ParticipanteChatRepository.getByIdAsync(entity.id); if (prev == null) return 0; return await this.ParticipanteChatRepository.updateAsync(entity); };
  deleteByIdAsync = async (id) => { console.log(`ParticipanteChatService.deleteByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id del participante es inválido.'); } return await this.ParticipanteChatRepository.deleteByIdAsync(id); };

  validarParticipanteParaCrear = (entity) => {
    if (!entity) throw new Error('El participante es obligatorio.');
    if (!entity.id_chat) throw new Error('id_chat es obligatorio.');
    if (!entity.id_usuario) throw new Error('id_usuario es obligatorio.');
    if (!entity.fecha_ingreso) throw new Error('fecha_ingreso es obligatorio.');
  };
}
