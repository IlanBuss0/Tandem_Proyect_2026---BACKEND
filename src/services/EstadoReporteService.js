import EstadoReporteRepository from '../repositories/EstadoReporteRepository.js';

export default class EstadoReporteService {
  constructor() {
    this.EstadoReporteRepository = new EstadoReporteRepository();
  }

  getAllAsync = async () => await this.EstadoReporteRepository.getAllAsync();
  getByIdAsync = async (id) => await this.EstadoReporteRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.EstadoReporteRepository.createAsync(entity);
  updateAsync = async (entity) => await this.EstadoReporteRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.EstadoReporteRepository.deleteByIdAsync(id);
}
