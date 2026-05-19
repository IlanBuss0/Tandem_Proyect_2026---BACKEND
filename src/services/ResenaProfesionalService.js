import ResenaProfesionalRepository from '../repositories/ResenaProfesionalRepository.js';

export default class ResenaProfesionalService {
  constructor() {
    this.ResenaProfesionalRepository = new ResenaProfesionalRepository();
  }

  getAllAsync = async () => await this.ResenaProfesionalRepository.getAllAsync();
  getByIdAsync = async (id) => await this.ResenaProfesionalRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.ResenaProfesionalRepository.createAsync(entity);
  updateAsync = async (entity) => await this.ResenaProfesionalRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.ResenaProfesionalRepository.deleteByIdAsync(id);
}
