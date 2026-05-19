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
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.PlanSuscripcionRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`PlanSuscripcionService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.PlanSuscripcionRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`PlanSuscripcionService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.PlanSuscripcionRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.PlanSuscripcionRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`PlanSuscripcionService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.PlanSuscripcionRepository.deleteByIdAsync(id);
  };
}
