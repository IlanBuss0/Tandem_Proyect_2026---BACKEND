import AvatarRepository from '../repositories/AvatarRepository.js';

export default class AvatarService {
  constructor() {
    console.log('Estoy en: AvatarService.constructor()');
    this.AvatarRepository = new AvatarRepository();
  }

  getAllAsync = async () => {
    console.log('AvatarService.getAllAsync()');
    const returnArray = await this.AvatarRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`AvatarService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id del avatar es invalido.');
    }
    const returnEntity = await this.AvatarRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`AvatarService.createAsync(${JSON.stringify(entity)})`);
    this.validarAvatarParaCrear(entity);

    const avatarConMismoPerteneciente = await this.AvatarRepository.getByPertenecienteIdAsync(entity.id_perteneciente);

    if (avatarConMismoPerteneciente != null) {
      throw new Error(`Ya existe un avatar asociado al perteneciente con id ${entity.id_perteneciente}.`);
    }

    const newId = await this.AvatarRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`AvatarService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id del avatar es obligatorio para actualizar.');
    }
    const previousEntity = await this.AvatarRepository.getByIdAsync(entity.id);
    if (previousEntity == null) return 0;

    if (entity.id_perteneciente && entity.id_perteneciente !== previousEntity.id_perteneciente) {
      const avatarConMismoPerteneciente = await this.AvatarRepository.getByPertenecienteIdAsync(entity.id_perteneciente);

      if (avatarConMismoPerteneciente != null) {
        throw new Error(`Ya existe un avatar asociado al perteneciente con id ${entity.id_perteneciente}.`);
      }
    }

    const rowsAffected = await this.AvatarRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`AvatarService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id del avatar es invalido.');
    }
    const rowsAffected = await this.AvatarRepository.deleteByIdAsync(id);
    return rowsAffected;
  };

  validarAvatarParaCrear = (entity) => {
    if (!entity) {
      throw new Error('El avatar es obligatorio.');
    }
    if (!entity.id_perteneciente) {
      throw new Error('id_perteneciente es obligatorio.');
    }
  };
}
