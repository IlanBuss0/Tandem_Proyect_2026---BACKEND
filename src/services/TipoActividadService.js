import TipoActividadRepository from '../repositories/TipoActividadRepository.js';

export default class TipoActividadService {
  constructor() {
    this.TipoActividadRepository = new TipoActividadRepository();
  }

  getAllAsync = async () => await this.TipoActividadRepository.getAllAsync();
  getByIdAsync = async (id) => await this.TipoActividadRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.TipoActividadRepository.createAsync(entity);
  updateAsync = async (entity) => await this.TipoActividadRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.TipoActividadRepository.deleteByIdAsync(id);
}
