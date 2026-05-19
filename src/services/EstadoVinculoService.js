import EstadoVinculoRepository from '../repositories/EstadoVinculoRepository.js';

export default class EstadoVinculoService {
  constructor() {
    this.EstadoVinculoRepository = new EstadoVinculoRepository();
  }

  getAllAsync = async () => await this.EstadoVinculoRepository.getAllAsync();
  getByIdAsync = async (id) => await this.EstadoVinculoRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.EstadoVinculoRepository.createAsync(entity);
  updateAsync = async (entity) => await this.EstadoVinculoRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.EstadoVinculoRepository.deleteByIdAsync(id);
}
