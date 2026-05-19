import PaquetePuntoRepository from '../repositories/PaquetePuntoRepository.js';

export default class PaquetePuntoService {
  constructor() {
    this.PaquetePuntoRepository = new PaquetePuntoRepository();
  }

  getAllAsync = async () => await this.PaquetePuntoRepository.getAllAsync();
  getByIdAsync = async (id) => await this.PaquetePuntoRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.PaquetePuntoRepository.createAsync(entity);
  updateAsync = async (entity) => await this.PaquetePuntoRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.PaquetePuntoRepository.deleteByIdAsync(id);
}
