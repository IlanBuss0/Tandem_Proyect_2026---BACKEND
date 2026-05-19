import TipoNotificacionRepository from '../repositories/TipoNotificacionRepository.js';

export default class TipoNotificacionService {
  constructor() {
    this.TipoNotificacionRepository = new TipoNotificacionRepository();
  }

  getAllAsync = async () => await this.TipoNotificacionRepository.getAllAsync();
  getByIdAsync = async (id) => await this.TipoNotificacionRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.TipoNotificacionRepository.createAsync(entity);
  updateAsync = async (entity) => await this.TipoNotificacionRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.TipoNotificacionRepository.deleteByIdAsync(id);
}
