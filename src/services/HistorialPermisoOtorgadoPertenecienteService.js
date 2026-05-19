import HistorialPermisoOtorgadoPertenecienteRepository from '../repositories/HistorialPermisoOtorgadoPertenecienteRepository.js';

export default class HistorialPermisoOtorgadoPertenecienteService {
  constructor() {
    this.HistorialPermisoOtorgadoPertenecienteRepository = new HistorialPermisoOtorgadoPertenecienteRepository();
  }

  getAllAsync = async () => await this.HistorialPermisoOtorgadoPertenecienteRepository.getAllAsync();
  getByIdAsync = async (id) => await this.HistorialPermisoOtorgadoPertenecienteRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.HistorialPermisoOtorgadoPertenecienteRepository.createAsync(entity);
  updateAsync = async (entity) => await this.HistorialPermisoOtorgadoPertenecienteRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.HistorialPermisoOtorgadoPertenecienteRepository.deleteByIdAsync(id);
}
