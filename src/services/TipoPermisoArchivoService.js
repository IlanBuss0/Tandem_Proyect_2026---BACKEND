import TipoPermisoArchivoRepository from '../repositories/TipoPermisoArchivoRepository.js';

export default class TipoPermisoArchivoService {
  constructor() {
    console.log('Estoy en: TipoPermisoArchivoService.constructor()');
    this.TipoPermisoArchivoRepository = new TipoPermisoArchivoRepository();
  }

  getAllAsync = async () => {
    console.log('TipoPermisoArchivoService.getAllAsync()');
    const returnArray = await this.TipoPermisoArchivoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`TipoPermisoArchivoService.getByIdAsync(${id})`);
    const returnEntity = await this.TipoPermisoArchivoRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`TipoPermisoArchivoService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.TipoPermisoArchivoRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`TipoPermisoArchivoService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.TipoPermisoArchivoRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`TipoPermisoArchivoService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.TipoPermisoArchivoRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
