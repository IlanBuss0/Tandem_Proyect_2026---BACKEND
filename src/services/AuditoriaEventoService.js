import AuditoriaEventoRepository from '../repositories/AuditoriaEventoRepository.js';

export default class AuditoriaEventoService {
  constructor() {
    this.AuditoriaEventoRepository = new AuditoriaEventoRepository();
  }

  getAllAsync = async () => await this.AuditoriaEventoRepository.getAllAsync();
  getByIdAsync = async (id) => await this.AuditoriaEventoRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.AuditoriaEventoRepository.createAsync(entity);
  updateAsync = async (entity) => await this.AuditoriaEventoRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.AuditoriaEventoRepository.deleteByIdAsync(id);
}
