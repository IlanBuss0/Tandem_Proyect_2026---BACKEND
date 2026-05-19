import TipoChatRepository from '../repositories/TipoChatRepository.js';

export default class TipoChatService {
  constructor() {
    this.TipoChatRepository = new TipoChatRepository();
  }

  getAllAsync = async () => await this.TipoChatRepository.getAllAsync();
  getByIdAsync = async (id) => await this.TipoChatRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.TipoChatRepository.createAsync(entity);
  updateAsync = async (entity) => await this.TipoChatRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.TipoChatRepository.deleteByIdAsync(id);
}
