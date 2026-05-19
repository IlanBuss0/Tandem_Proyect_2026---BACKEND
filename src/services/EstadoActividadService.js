import EstadoActividadRepository from '../repositories/EstadoActividadRepository.js';

export default class EstadoActividadService {
  constructor() {
    this.EstadoActividadRepository = new EstadoActividadRepository();
  }

  getAllAsync = async () => await this.EstadoActividadRepository.getAllAsync();
  getByIdAsync = async (id) => await this.EstadoActividadRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.EstadoActividadRepository.createAsync(entity);
  updateAsync = async (entity) => await this.EstadoActividadRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.EstadoActividadRepository.deleteByIdAsync(id);
}
