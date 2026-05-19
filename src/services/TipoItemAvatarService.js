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
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.TipoItemAvatarRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`TipoItemAvatarService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.TipoItemAvatarRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`TipoItemAvatarService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.TipoItemAvatarRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.TipoItemAvatarRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`TipoItemAvatarService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.TipoItemAvatarRepository.deleteByIdAsync(id);
  };
}
