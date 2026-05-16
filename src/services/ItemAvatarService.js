import ItemAvatarRepository from '../repositories/ItemAvatarRepository.js';

export default class ItemAvatarService {
  constructor() {
    console.log('Estoy en: ItemAvatarService.constructor()');
    this.ItemAvatarRepository = new ItemAvatarRepository();
  }

  getAllAsync = async () => {
    console.log('ItemAvatarService.getAllAsync()');
    const returnArray = await this.ItemAvatarRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`ItemAvatarService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id del item de avatar es inválido.');
    }
    const returnEntity = await this.ItemAvatarRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`ItemAvatarService.createAsync(${JSON.stringify(entity)})`);
    this.validarItemAvatarParaCrear(entity);
    const newId = await this.ItemAvatarRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`ItemAvatarService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id del item de avatar es obligatorio para actualizar.');
    }
    const previousEntity = await this.ItemAvatarRepository.getByIdAsync(entity.id);
    if (previousEntity == null) return 0;
    const rowsAffected = await this.ItemAvatarRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`ItemAvatarService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id del item de avatar es inválido.');
    }
    const rowsAffected = await this.ItemAvatarRepository.deleteByIdAsync(id);
    return rowsAffected;
  };

  validarItemAvatarParaCrear = (entity) => {
    if (!entity) {
      throw new Error('El item de avatar es obligatorio.');
    }
    if (!entity.id_tipo_item_avatar) {
      throw new Error('id_tipo_item_avatar es obligatorio.');
    }
    if (!entity.nombre) {
      throw new Error('nombre es obligatorio.');
    }
    if (entity.precio_punto === undefined || entity.precio_punto === null) {
      throw new Error('precio_punto es obligatorio.');
    }
  };
}
