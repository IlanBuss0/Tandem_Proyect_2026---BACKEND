import EstadoValidacionProfesionalRepository from '../repositories/EstadoValidacionProfesionalRepository.js';

export default class EstadoValidacionProfesionalService {
  constructor() {
    this.EstadoValidacionProfesionalRepository = new EstadoValidacionProfesionalRepository();
  }

  getAllAsync = async () => await this.EstadoValidacionProfesionalRepository.getAllAsync();
  getByIdAsync = async (id) => await this.EstadoValidacionProfesionalRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.EstadoValidacionProfesionalRepository.createAsync(entity);
  updateAsync = async (entity) => await this.EstadoValidacionProfesionalRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.EstadoValidacionProfesionalRepository.deleteByIdAsync(id);
}
