import EstadoContactoRepository from '../repositories/EstadoContactoRepository.js';

export default class EstadoContactoService {
  constructor() {
    this.EstadoContactoRepository = new EstadoContactoRepository();
  }

  getAllAsync = async () => await this.EstadoContactoRepository.getAllAsync();
  getByIdAsync = async (id) => await this.EstadoContactoRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.EstadoContactoRepository.createAsync(entity);
  updateAsync = async (entity) => await this.EstadoContactoRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.EstadoContactoRepository.deleteByIdAsync(id);
}
