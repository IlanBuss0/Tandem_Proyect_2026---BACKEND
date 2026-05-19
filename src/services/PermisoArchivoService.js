import PermisoArchivoRepository from '../repositories/PermisoArchivoRepository.js';

export default class PermisoArchivoService {
  constructor() {
    this.PermisoArchivoRepository = new PermisoArchivoRepository();
  }

  getAllAsync = async () => await this.PermisoArchivoRepository.getAllAsync();
  getByIdAsync = async (id) => await this.PermisoArchivoRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.PermisoArchivoRepository.createAsync(entity);
  updateAsync = async (entity) => await this.PermisoArchivoRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.PermisoArchivoRepository.deleteByIdAsync(id);
}
