import PermisoOtorgadoPertenecienteRepository from '../repositories/PermisoOtorgadoPertenecienteRepository.js';

export default class PermisoOtorgadoPertenecienteService {
  constructor() {
    this.PermisoOtorgadoPertenecienteRepository = new PermisoOtorgadoPertenecienteRepository();
  }

  getAllAsync = async () => await this.PermisoOtorgadoPertenecienteRepository.getAllAsync();
  getByIdAsync = async (id) => await this.PermisoOtorgadoPertenecienteRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.PermisoOtorgadoPertenecienteRepository.createAsync(entity);
  updateAsync = async (entity) => await this.PermisoOtorgadoPertenecienteRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.PermisoOtorgadoPertenecienteRepository.deleteByIdAsync(id);
}
