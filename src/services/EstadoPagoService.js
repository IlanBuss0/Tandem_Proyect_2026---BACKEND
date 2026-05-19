import EstadoPagoRepository from '../repositories/EstadoPagoRepository.js';

export default class EstadoPagoService {
  constructor() {
    console.log('Estoy en: EstadoPagoService.constructor()');
    this.EstadoPagoRepository = new EstadoPagoRepository();
  }

  getAllAsync = async () => {
    console.log('EstadoPagoService.getAllAsync()');
    const returnArray = await this.EstadoPagoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`EstadoPagoService.getByIdAsync(${id})`);
    const returnEntity = await this.EstadoPagoRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`EstadoPagoService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.EstadoPagoRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`EstadoPagoService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.EstadoPagoRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`EstadoPagoService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.EstadoPagoRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
