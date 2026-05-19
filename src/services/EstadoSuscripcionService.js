import EstadoSuscripcionRepository from '../repositories/EstadoSuscripcionRepository.js';

export default class EstadoSuscripcionService {
  constructor() {
    this.EstadoSuscripcionRepository = new EstadoSuscripcionRepository();
  }

  getAllAsync = async () => await this.EstadoSuscripcionRepository.getAllAsync();
  getByIdAsync = async (id) => await this.EstadoSuscripcionRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.EstadoSuscripcionRepository.createAsync(entity);
  updateAsync = async (entity) => await this.EstadoSuscripcionRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.EstadoSuscripcionRepository.deleteByIdAsync(id);
}
