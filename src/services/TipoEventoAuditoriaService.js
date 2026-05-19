import TipoEventoAuditoriaRepository from '../repositories/TipoEventoAuditoriaRepository.js';

export default class TipoEventoAuditoriaService {
  constructor() {
    this.TipoEventoAuditoriaRepository = new TipoEventoAuditoriaRepository();
  }

  getAllAsync = async () => await this.TipoEventoAuditoriaRepository.getAllAsync();
  getByIdAsync = async (id) => await this.TipoEventoAuditoriaRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.TipoEventoAuditoriaRepository.createAsync(entity);
  updateAsync = async (entity) => await this.TipoEventoAuditoriaRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.TipoEventoAuditoriaRepository.deleteByIdAsync(id);
}
