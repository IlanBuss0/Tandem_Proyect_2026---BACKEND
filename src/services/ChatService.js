import BaseCrudService from './BaseCrudService.js';
import ChatRepository from '../repositories/ChatRepository.js';
import AppError from '../modules/errors/AppError.js';
class ChatService extends BaseCrudService {
  constructor() { super(ChatRepository, { hiddenFields: [] }); }
  listMensajes(idConversacion) { return this.repository.findMensajes(idConversacion); }
  createMensaje(idConversacion, body) { return this.repository.createMensaje(idConversacion, body); }
  async updateMensaje(id, body) { const r=await this.repository.updateMensaje(id, body); if(!r) throw new AppError('Mensaje no encontrado',404); return r; }
  async removeMensaje(id) { const c=await this.repository.removeMensaje(id); if(!c) throw new AppError('Mensaje no encontrado',404); }
  listConversacionesByUsuario(idUsuario) { return this.repository.findConversacionesByUsuario(idUsuario); }
}
export default new ChatService();
