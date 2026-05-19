import PagoSuscripcionRepository from '../repositories/PagoSuscripcionRepository.js';

export default class PagoSuscripcionService {
  constructor() {
    this.PagoSuscripcionRepository = new PagoSuscripcionRepository();
  }

  getAllAsync = async () => await this.PagoSuscripcionRepository.getAllAsync();
  getByIdAsync = async (id) => await this.PagoSuscripcionRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.PagoSuscripcionRepository.createAsync(entity);
  updateAsync = async (entity) => await this.PagoSuscripcionRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.PagoSuscripcionRepository.deleteByIdAsync(id);
}
