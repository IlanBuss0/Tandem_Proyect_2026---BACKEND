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
    const returnEntity = await this.PermisoArchivoRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`PermisoArchivoService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.PermisoArchivoRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`PermisoArchivoService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.PermisoArchivoRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`PermisoArchivoService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.PermisoArchivoRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
