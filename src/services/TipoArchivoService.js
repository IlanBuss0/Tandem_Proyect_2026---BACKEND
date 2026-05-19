import TipoArchivoRepository from '../repositories/TipoArchivoRepository.js';

export default class TipoArchivoService {
  constructor() {
    console.log('Estoy en: TipoArchivoService.constructor()');
    this.TipoArchivoRepository = new TipoArchivoRepository();
  }

  getAllAsync = async () => {
    console.log('TipoArchivoService.getAllAsync()');
    const returnArray = await this.TipoArchivoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`TipoArchivoService.getByIdAsync(${id})`);
    const returnEntity = await this.TipoArchivoRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`TipoArchivoService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.TipoArchivoRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`TipoArchivoService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.TipoArchivoRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`TipoArchivoService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.TipoArchivoRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
