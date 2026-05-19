import AutonomiaOperativaRepository from '../repositories/AutonomiaOperativaRepository.js';

export default class AutonomiaOperativaService {
  constructor() {
    this.AutonomiaOperativaRepository = new AutonomiaOperativaRepository();
  }

  getAllAsync = async () => await this.AutonomiaOperativaRepository.getAllAsync();
  getByIdAsync = async (id) => await this.AutonomiaOperativaRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.AutonomiaOperativaRepository.createAsync(entity);
  updateAsync = async (entity) => await this.AutonomiaOperativaRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.AutonomiaOperativaRepository.deleteByIdAsync(id);
}
