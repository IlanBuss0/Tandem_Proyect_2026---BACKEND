import TipoItemAvatarRepository from '../repositories/TipoItemAvatarRepository.js';

export default class TipoItemAvatarService {
  constructor() {
    console.log('Estoy en: TipoItemAvatarService.constructor()');
    this.TipoItemAvatarRepository = new TipoItemAvatarRepository();
  }

  getAllAsync = async () => {
    console.log('TipoItemAvatarService.getAllAsync()');
    const returnArray = await this.TipoItemAvatarRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`TipoItemAvatarService.getByIdAsync(${id})`);
    const returnEntity = await this.TipoItemAvatarRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`TipoItemAvatarService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.TipoItemAvatarRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`TipoItemAvatarService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.TipoItemAvatarRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`TipoItemAvatarService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.TipoItemAvatarRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
