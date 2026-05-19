import HistorialPermisoOtorgadoProfesionalRepository from '../repositories/HistorialPermisoOtorgadoProfesionalRepository.js';

export default class HistorialPermisoOtorgadoProfesionalService {
  constructor() {
    this.HistorialPermisoOtorgadoProfesionalRepository = new HistorialPermisoOtorgadoProfesionalRepository();
  }

  getAllAsync = async () => await this.HistorialPermisoOtorgadoProfesionalRepository.getAllAsync();
  getByIdAsync = async (id) => await this.HistorialPermisoOtorgadoProfesionalRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.HistorialPermisoOtorgadoProfesionalRepository.createAsync(entity);
  updateAsync = async (entity) => await this.HistorialPermisoOtorgadoProfesionalRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.HistorialPermisoOtorgadoProfesionalRepository.deleteByIdAsync(id);
}
