import PerfilProfesionalRepository from '../repositories/PerfilProfesionalRepository.js';

export default class PerfilProfesionalService {
  constructor() {
    this.PerfilProfesionalRepository = new PerfilProfesionalRepository();
  }

  getAllAsync = async () => await this.PerfilProfesionalRepository.getAllAsync();
  getByIdAsync = async (id) => await this.PerfilProfesionalRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.PerfilProfesionalRepository.createAsync(entity);
  updateAsync = async (entity) => await this.PerfilProfesionalRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.PerfilProfesionalRepository.deleteByIdAsync(id);
}
