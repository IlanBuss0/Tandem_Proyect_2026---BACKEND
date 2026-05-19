import EstadoPagoRepository from '../repositories/EstadoPagoRepository.js';

export default class EstadoPagoService {
  constructor() {
    this.EstadoPagoRepository = new EstadoPagoRepository();
  }

  getAllAsync = async () => await this.EstadoPagoRepository.getAllAsync();
  getByIdAsync = async (id) => await this.EstadoPagoRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.EstadoPagoRepository.createAsync(entity);
  updateAsync = async (entity) => await this.EstadoPagoRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.EstadoPagoRepository.deleteByIdAsync(id);
}
