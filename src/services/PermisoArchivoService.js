import PermisoArchivoRepository from '../repositories/PermisoArchivoRepository.js';

export default class PermisoArchivoService {
  constructor() {
    console.log('Estoy en: PermisoArchivoService.constructor()');
    this.PermisoArchivoRepository = new PermisoArchivoRepository();
  }

  getAllAsync = async () => {
    console.log('PermisoArchivoService.getAllAsync()');
    const returnArray = await this.PermisoArchivoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`PermisoArchivoService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.PermisoArchivoRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`PermisoArchivoService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.PermisoArchivoRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`PermisoArchivoService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.PermisoArchivoRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.PermisoArchivoRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`PermisoArchivoService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.PermisoArchivoRepository.deleteByIdAsync(id);
  };
}
