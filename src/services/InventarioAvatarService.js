import InventarioAvatarRepository from '../repositories/InventarioAvatarRepository.js';

export default class InventarioAvatarService {
  constructor() {
    console.log('Estoy en: InventarioAvatarService.constructor()');
    this.InventarioAvatarRepository = new InventarioAvatarRepository();
  }

  getAllAsync = async () => {
    console.log('InventarioAvatarService.getAllAsync()');
    const returnArray = await this.InventarioAvatarRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`InventarioAvatarService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id del inventario es invalido.');
    }
    const returnEntity = await this.InventarioAvatarRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`InventarioAvatarService.createAsync(${JSON.stringify(entity)})`);
    this.validarInventarioParaCrear(entity);

    const existente = await this.InventarioAvatarRepository.getByAvatarAndItemAsync(entity.id_avatar, entity.id_item_avatar);
    if (existente != null) {
      throw new Error(`El avatar con id ${entity.id_avatar} ya tiene el item con id ${entity.id_item_avatar}.`);
    }

    const newId = await this.InventarioAvatarRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`InventarioAvatarService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id del inventario es obligatorio para actualizar.');
    }
    const previousEntity = await this.InventarioAvatarRepository.getByIdAsync(entity.id);
    if (previousEntity == null) return 0;
    const rowsAffected = await this.InventarioAvatarRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`InventarioAvatarService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id del inventario es invalido.');
    }
    const rowsAffected = await this.InventarioAvatarRepository.deleteByIdAsync(id);
    return rowsAffected;
  };

  validarInventarioParaCrear = (entity) => {
    if (!entity) {
      throw new Error('El inventario es obligatorio.');
    }
    if (!entity.id_avatar) {
      throw new Error('id_avatar es obligatorio.');
    }
    if (!entity.id_item_avatar) {
      throw new Error('id_item_avatar es obligatorio.');
    }
    if (!entity.fecha_obtencion) {
      throw new Error('fecha_obtencion es obligatorio.');
    }
  };
}
