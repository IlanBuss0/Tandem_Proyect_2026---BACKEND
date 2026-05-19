import DificultadActividadRepository from '../repositories/DificultadActividadRepository.js';

export default class DificultadActividadService {
  constructor() {
    this.DificultadActividadRepository = new DificultadActividadRepository();
  }

  getAllAsync = async () => await this.DificultadActividadRepository.getAllAsync();
  getByIdAsync = async (id) => await this.DificultadActividadRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.DificultadActividadRepository.createAsync(entity);
  updateAsync = async (entity) => await this.DificultadActividadRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.DificultadActividadRepository.deleteByIdAsync(id);
}
