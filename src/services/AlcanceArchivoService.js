import AlcanceArchivoRepository from '../repositories/AlcanceArchivoRepository.js';

export default class AlcanceArchivoService {
  constructor() {
    console.log('Estoy en: AlcanceArchivoService.constructor()');
    this.AlcanceArchivoRepository = new AlcanceArchivoRepository();
  }

  getAllAsync = async () => {
    console.log('AlcanceArchivoService.getAllAsync()');
    const returnArray = await this.AlcanceArchivoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`AlcanceArchivoService.getByIdAsync(${id})`);
    const returnEntity = await this.AlcanceArchivoRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`AlcanceArchivoService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.AlcanceArchivoRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`AlcanceArchivoService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.AlcanceArchivoRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`AlcanceArchivoService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.AlcanceArchivoRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
