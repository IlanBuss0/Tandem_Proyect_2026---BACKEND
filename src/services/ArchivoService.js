import ArchivoRepository from '../repositories/ArchivoRepository.js';

export default class ArchivoService {
  constructor() {
    console.log('Estoy en: ArchivoService.constructor()');
    this.ArchivoRepository = new ArchivoRepository();
  }

  getAllAsync = async () => {
    console.log('ArchivoService.getAllAsync()');
    const returnArray = await this.ArchivoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`ArchivoService.getByIdAsync(${id})`);
    const returnEntity = await this.ArchivoRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`ArchivoService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.ArchivoRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`ArchivoService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.ArchivoRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`ArchivoService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.ArchivoRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
