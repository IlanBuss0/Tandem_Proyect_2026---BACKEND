import PlanSuscripcionRepository from '../repositories/PlanSuscripcionRepository.js';

export default class PlanSuscripcionService {
  constructor() {
    this.PlanSuscripcionRepository = new PlanSuscripcionRepository();
  }

  getAllAsync = async () => await this.PlanSuscripcionRepository.getAllAsync();
  getByIdAsync = async (id) => await this.PlanSuscripcionRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.PlanSuscripcionRepository.createAsync(entity);
  updateAsync = async (entity) => await this.PlanSuscripcionRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.PlanSuscripcionRepository.deleteByIdAsync(id);
}
