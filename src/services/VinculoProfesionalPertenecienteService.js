import VinculoProfesionalPertenecienteRepository from '../repositories/VinculoProfesionalPertenecienteRepository.js';

export default class VinculoProfesionalPertenecienteService {
  constructor() {
    this.VinculoProfesionalPertenecienteRepository = new VinculoProfesionalPertenecienteRepository();
  }

  getAllAsync = async () => await this.VinculoProfesionalPertenecienteRepository.getAllAsync();
  getByIdAsync = async (id) => await this.VinculoProfesionalPertenecienteRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.VinculoProfesionalPertenecienteRepository.createAsync(entity);
  updateAsync = async (entity) => await this.VinculoProfesionalPertenecienteRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.VinculoProfesionalPertenecienteRepository.deleteByIdAsync(id);
}
