import CatalogoPermisoPertenecienteRepository from '../repositories/CatalogoPermisoPertenecienteRepository.js';

export default class CatalogoPermisoPertenecienteService {
  constructor() {
    this.CatalogoPermisoPertenecienteRepository = new CatalogoPermisoPertenecienteRepository();
  }

  getAllAsync = async () => await this.CatalogoPermisoPertenecienteRepository.getAllAsync();
  getByIdAsync = async (id) => await this.CatalogoPermisoPertenecienteRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.CatalogoPermisoPertenecienteRepository.createAsync(entity);
  updateAsync = async (entity) => await this.CatalogoPermisoPertenecienteRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.CatalogoPermisoPertenecienteRepository.deleteByIdAsync(id);
}
