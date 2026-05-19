import MensajeArchivoRepository from '../repositories/MensajeArchivoRepository.js';

export default class MensajeArchivoService {
  constructor() {
    console.log('Estoy en: MensajeArchivoService.constructor()');
    this.MensajeArchivoRepository = new MensajeArchivoRepository();
  }

  getAllAsync = async () => {
    console.log('MensajeArchivoService.getAllAsync()');
    const returnArray = await this.MensajeArchivoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`MensajeArchivoService.getByIdAsync(${id})`);
    const returnEntity = await this.MensajeArchivoRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`MensajeArchivoService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.MensajeArchivoRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`MensajeArchivoService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.MensajeArchivoRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`MensajeArchivoService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.MensajeArchivoRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
