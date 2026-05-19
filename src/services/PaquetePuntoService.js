import PaquetePuntoRepository from '../repositories/PaquetePuntoRepository.js';

export default class PaquetePuntoService {
  constructor() {
    console.log('Estoy en: PaquetePuntoService.constructor()');
    this.PaquetePuntoRepository = new PaquetePuntoRepository();
  }

  getAllAsync = async () => {
    console.log('PaquetePuntoService.getAllAsync()');
    const returnArray = await this.PaquetePuntoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`PaquetePuntoService.getByIdAsync(${id})`);
    const returnEntity = await this.PaquetePuntoRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`PaquetePuntoService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.PaquetePuntoRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`PaquetePuntoService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.PaquetePuntoRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`PaquetePuntoService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.PaquetePuntoRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
