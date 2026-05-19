import EstadoSuscripcionRepository from '../repositories/EstadoSuscripcionRepository.js';

export default class EstadoSuscripcionService {
  constructor() {
    console.log('Estoy en: EstadoSuscripcionService.constructor()');
    this.EstadoSuscripcionRepository = new EstadoSuscripcionRepository();
  }

  getAllAsync = async () => {
    console.log('EstadoSuscripcionService.getAllAsync()');
    const returnArray = await this.EstadoSuscripcionRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`EstadoSuscripcionService.getByIdAsync(${id})`);
    const returnEntity = await this.EstadoSuscripcionRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`EstadoSuscripcionService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.EstadoSuscripcionRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`EstadoSuscripcionService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.EstadoSuscripcionRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`EstadoSuscripcionService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.EstadoSuscripcionRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
