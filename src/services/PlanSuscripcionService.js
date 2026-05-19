import PlanSuscripcionRepository from '../repositories/PlanSuscripcionRepository.js';

export default class PlanSuscripcionService {
  constructor() {
    console.log('Estoy en: PlanSuscripcionService.constructor()');
    this.PlanSuscripcionRepository = new PlanSuscripcionRepository();
  }

  getAllAsync = async () => {
    console.log('PlanSuscripcionService.getAllAsync()');
    const returnArray = await this.PlanSuscripcionRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`PlanSuscripcionService.getByIdAsync(${id})`);
    const returnEntity = await this.PlanSuscripcionRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`PlanSuscripcionService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.PlanSuscripcionRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`PlanSuscripcionService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.PlanSuscripcionRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`PlanSuscripcionService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.PlanSuscripcionRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
