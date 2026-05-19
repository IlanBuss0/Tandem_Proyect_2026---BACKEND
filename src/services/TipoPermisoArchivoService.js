import TipoPermisoArchivoRepository from '../repositories/TipoPermisoArchivoRepository.js';

export default class TipoPermisoArchivoService {
  constructor() {
    this.TipoPermisoArchivoRepository = new TipoPermisoArchivoRepository();
  }

  getAllAsync = async () => await this.TipoPermisoArchivoRepository.getAllAsync();
  getByIdAsync = async (id) => await this.TipoPermisoArchivoRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.TipoPermisoArchivoRepository.createAsync(entity);
  updateAsync = async (entity) => await this.TipoPermisoArchivoRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.TipoPermisoArchivoRepository.deleteByIdAsync(id);
}
