import TipoItemAvatarRepository from '../repositories/TipoItemAvatarRepository.js';

export default class TipoItemAvatarService {
  constructor() {
    this.TipoItemAvatarRepository = new TipoItemAvatarRepository();
  }

  getAllAsync = async () => await this.TipoItemAvatarRepository.getAllAsync();
  getByIdAsync = async (id) => await this.TipoItemAvatarRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.TipoItemAvatarRepository.createAsync(entity);
  updateAsync = async (entity) => await this.TipoItemAvatarRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.TipoItemAvatarRepository.deleteByIdAsync(id);
}
