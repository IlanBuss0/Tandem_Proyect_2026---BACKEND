import EntidadAfectadaAuditoriaRepository from '../repositories/EntidadAfectadaAuditoriaRepository.js';

export default class EntidadAfectadaAuditoriaService {
  constructor() {
    this.EntidadAfectadaAuditoriaRepository = new EntidadAfectadaAuditoriaRepository();
  }

  getAllAsync = async () => await this.EntidadAfectadaAuditoriaRepository.getAllAsync();
  getByIdAsync = async (id) => await this.EntidadAfectadaAuditoriaRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.EntidadAfectadaAuditoriaRepository.createAsync(entity);
  updateAsync = async (entity) => await this.EntidadAfectadaAuditoriaRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.EntidadAfectadaAuditoriaRepository.deleteByIdAsync(id);
}
