import PagoSuscripcionRepository from '../repositories/PagoSuscripcionRepository.js';

export default class PagoSuscripcionService {
  constructor() {
    console.log('Estoy en: PagoSuscripcionService.constructor()');
    this.PagoSuscripcionRepository = new PagoSuscripcionRepository();
  }

  getAllAsync = async () => {
    console.log('PagoSuscripcionService.getAllAsync()');
    const returnArray = await this.PagoSuscripcionRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`PagoSuscripcionService.getByIdAsync(${id})`);
    const returnEntity = await this.PagoSuscripcionRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`PagoSuscripcionService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.PagoSuscripcionRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`PagoSuscripcionService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.PagoSuscripcionRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`PagoSuscripcionService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.PagoSuscripcionRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
